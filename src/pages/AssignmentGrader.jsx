import React, { useState } from 'react';
import { Upload, Button, Card, Typography, message, Spin, Space, Alert, Avatar, Row, Col, Tag } from 'antd';
import { UploadOutlined, RedoOutlined, FileTextOutlined, CheckCircleOutlined, EditOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import mammoth from 'mammoth';
import { callLLM } from '../utils/llm';
import defaultImage from '../assets/default.jpg';
import './AssignmentGrader.css';

const { Title, Paragraph, Text } = Typography;

const AssignmentGrader = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [currentFile, setCurrentFile] = useState(null);
  const [error, setError] = useState(null);

  const handleReset = () => {
    setResult(null);
    setCurrentFile(null);
    setError(null);
    message.info('可以开始批改下一份作业了。');
  };

  const gradeContent = async (fileContent) => {
    const MAX_LENGTH = 8000;
    let processedContent = fileContent;

    if (fileContent.length > MAX_LENGTH) {
      const half = MAX_LENGTH / 2;
      processedContent =
        fileContent.substring(0, half) +
        `\n\n... (内容过长，已截断中间部分) ...\n\n` +
        fileContent.substring(fileContent.length - half);
      message.warning('作业内容过长，AI将只分析开头和结尾部分。');
    }

    const systemPrompt = `你是一位经验丰富的助教，负责批改学生作业。请根据作业内容，给出一个评分和评语。作业内容如果被截断，请在评语中说明。\n你的回答必须遵循以下JSON格式，不要添加任何额外的解释或说明文字：\n{\n  \"score\": \"一个百分制的分数，例如 '85/100'。\",\n  \"comments\": \"一段详细的评语，包括优点、可改进之处和综合评价，使用Markdown格式。\"\n}`;
    const userPrompt = `请批改这份作业的内容：\n\n${processedContent}`;

    const llmResponse = await callLLM([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    if (llmResponse.success) {
      try {
        const parsedResult = JSON.parse(llmResponse.data);
        setResult(parsedResult);
        message.success(`《${currentFile?.name}》已批改完成！`);
      } catch (e) {
        const errorMsg = "AI返回的数据格式不正确，无法解析。";
        setError(errorMsg);
        message.error(errorMsg);
      }
    } else {
      setError(llmResponse.error);
      message.error(llmResponse.error);
    }
    setLoading(false);
  };

  const props = {
    name: 'file',
    customRequest: ({ onSuccess }) => setTimeout(() => onSuccess("ok"), 0),
    showUploadList: false,
    beforeUpload: (file) => {
      if (result) {
        message.warning('请先完成当前批改，或点击“批改下一份”');
        return Upload.LIST_IGNORE;
      }
      setCurrentFile(file);
      return true;
    },
    onChange: (info) => {
      if (info.file.status === 'uploading') {
        setLoading(true);
        setResult(null);
        setError(null);
        return;
      }
      if (info.file.status === 'done') {
        message.success(`《${info.file.name}》上传成功，AI正在读取并批改中...`);
        const file = info.file.originFileObj;

        const handleError = (errorMsg) => {
          setError(errorMsg);
          message.error(errorMsg);
          setLoading(false);
        };

        if (file.name.endsWith('.docx')) {
          const reader = new FileReader();
          reader.onload = async (e) => {
            try {
              const mammothResult = await mammoth.extractRawText({ arrayBuffer: e.target.result });
              await gradeContent(mammothResult.value);
            } catch (err) {
              console.error("Error reading docx file:", err);
              handleError(`解析 .docx 文件《${file.name}》失败。`);
            }
          };
          reader.onerror = () => handleError(`读取文件《${file.name}》失败。`);
          reader.readAsArrayBuffer(file);
        } else if (file.name.endsWith('.txt') || file.name.endsWith('.md')) {
          const reader = new FileReader();
          reader.onload = async (e) => await gradeContent(e.target.result);
          reader.onerror = () => handleError(`读取文件《${file.name}》失败。`);
          reader.readAsText(file, 'UTF-8');
        } else {
          handleError(`不支持的文件类型：${file.name}。请上传 .docx, .txt, 或 .md 文件。`);
        }
      } else if (info.file.status === 'error') {
        const errorMsg = `《${info.file.name}》文件上传失败.`;
        setError(errorMsg);
        message.error(errorMsg);
        setLoading(false);
      }
    },
  };

  return (
    <div className="assignment-grader-container">
      <div className="header-section">
        <Avatar size={80} src={defaultImage} />
        <div className="header-text">
          <Title level={3} style={{ margin: 0 }}>知书达鲤 - 作业智能批改</Title>
          <Paragraph style={{ margin: 0, marginTop: 8 }}>
            上传学生作业（支持 .docx, .txt, .md），AI助教将自动进行分析，提供初步评分和详细评语，帮助您快速掌握学生学习情况。
          </Paragraph>
        </div>
      </div>

      <Row gutter={32}>
        <Col xs={24} md={8}>
          <Card title="上传与操作" bordered={false} className="control-card">
            {error && <Alert message="错误" description={error} type="error" showIcon style={{ marginBottom: 24 }} />}
            <Space direction="vertical" style={{ width: '100%' }}>
              <Upload {...props} disabled={loading || result}>
                <Button icon={<UploadOutlined />} loading={loading} disabled={loading || result} block>
                  {loading ? '正在处理中...' : '点击上传作业'}
                </Button>
              </Upload>
              {result && (
                <Button icon={<RedoOutlined />} onClick={handleReset} block>
                  批改下一份
                </Button>
              )}
              <div className="supported-files">
                <Text type="secondary">支持的文件类型: .docx, .txt, .md</Text>
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={16}>
          <Spin spinning={loading} tip={`AI 正在分析《${currentFile?.name}》...`} size="large" style={{ width: '100%' }}>
            <Card 
              title={result ? `对《${currentFile?.name}》的批改结果` : "批改结果"} 
              bordered={false} 
              className="result-display-card"
              extra={result && <Tag color="blue">{`文件: ${currentFile?.name}`}</Tag>}
            >
              {result ? (
                <div>
                  <Title level={4} className="score-title">
                    <CheckCircleOutlined /> 评分：<Text strong className="score-text">{result.score}</Text>
                  </Title>
                  <Title level={5} className="comments-title"><EditOutlined /> 详细评语：</Title>
                  <div className="markdown-content">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.comments}</ReactMarkdown>
                  </div>
                </div>
              ) : (
                <div className="placeholder-content">
                  <FileTextOutlined style={{ fontSize: '48px', color: '#ccc' }} />
                  <Paragraph type="secondary" style={{ marginTop: 16 }}>
                    这里将显示作业的初步评分和评语...
                  </Paragraph>
                </div>
              )}
            </Card>
          </Spin>
        </Col>
      </Row>
    </div>
  );
};

export default AssignmentGrader;