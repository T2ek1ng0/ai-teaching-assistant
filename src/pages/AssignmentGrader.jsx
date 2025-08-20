import React, { useState } from 'react';
import { Upload, Button, Card, Typography, message, Spin, Space, Alert } from 'antd';
import { UploadOutlined, RedoOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { callLLM } from '../utils/llm';

const { Title, Paragraph } = Typography;

const AssignmentGrader = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [currentFile, setCurrentFile] = useState(null);
  const [error, setError] = useState(null);

  const handleReset = () => {
    setResult(null);
    setCurrentFile(null);
    setError(null);
  };

  const props = {
    name: 'file',
    customRequest: ({ onSuccess }) => {
      // Simulate a successful upload immediately without sending the file
      setTimeout(() => {
        onSuccess("ok");
      }, 0);
    },
    showUploadList: false,
    beforeUpload: (file) => {
      if (result) {
        message.warning('请先完成当前批改，或点击“批改下一份”');
        return Upload.LIST_IGNORE;
      }
      setCurrentFile(file);
      return true;
    },
    onChange: async (info) => {
      if (info.file.status === 'uploading') {
        setLoading(true);
        setResult(null);
        setError(null);
        return;
      }
      if (info.file.status === 'done') {
        message.success(`《${info.file.name}》上传成功，AI正在批改中...`);

        const systemPrompt = `你是一位经验丰富的助教，负责批改学生作业。请根据作业文件名，给出一个评分和评语。
你的回答必须遵循以下JSON格式，不要添加任何额外的解释或说明文字：
{
  "score": "一个百分制的分数，例如 '85/100'。",
  "comments": "一段详细的评语，包括优点、可改进之处和综合评价，使用Markdown格式。"
}`;
        const userPrompt = `请批改这份作业：${info.file.name}`;

        const llmResponse = await callLLM([
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ]);

        if (llmResponse.success) {
          try {
            const parsedResult = JSON.parse(llmResponse.data);
            setResult(parsedResult);
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
      } else if (info.file.status === 'error') {
        const errorMsg = `《${info.file.name}》文件上传失败.`;
        setError(errorMsg);
        message.error(errorMsg);
        setLoading(false);
      }
    },
  };

  return (
    <div>
      <Title level={4}>作业智能批改</Title>
      <Paragraph>请上传学生作业文件（如 .docx, .pdf），AI 将根据预设标准进行初步评分和给出评语。</Paragraph>
      
      {error && <Alert message="错误" description={error} type="error" showIcon style={{ marginBottom: 24 }} />}

      <Space>
        <Upload {...props} disabled={loading || result}>
          <Button icon={<UploadOutlined />} loading={loading} disabled={loading || result}>
            {loading ? '正在处理中...' : '点击上传作业'}
          </Button>
        </Upload>
        {result && (
          <Button icon={<RedoOutlined />} onClick={handleReset}>
            批改下一份
          </Button>
        )}
      </Space>

      <Spin spinning={loading} tip={`AI 正在分析《${currentFile?.name}》...`} size="large">
        <Card title={result ? `对《${currentFile?.name}》的批改结果` : "批改结果"} style={{ marginTop: 24 }}>
          {result ? (
            <div>
              <Title level={5}>评分：{result.score}</Title>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.comments}</ReactMarkdown>
            </div>
          ) : (
            <Paragraph>这里将显示作业的初步评分和评语...</Paragraph>
          )}
        </Card>
      </Spin>
    </div>
  );
};

export default AssignmentGrader;
