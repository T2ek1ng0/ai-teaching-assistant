import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Space, Spin, message, Alert, Dropdown, Avatar, Row, Col } from 'antd';
import { DownloadOutlined, FileWordOutlined, FileMarkdownOutlined, CopyOutlined, BookOutlined, BulbOutlined, ExperimentOutlined, CodeOutlined, FileTextOutlined } from '@ant-design/icons';
import { saveAs } from 'file-saver';
import { marked } from 'marked';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { callLLM } from '../utils/llm';
import defaultImage from '../assets/default.jpg';
import './CourseDesignAssistant.css';

const { Title, Paragraph, Text } = Typography;

const CourseDesignAssistant = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const onFinish = async (values) => {
    console.log('Received values of form: ', values);
    setLoading(true);
    setResult(null);
    setError(null);

    const systemPrompt = `你是一位顶级的教学设计师，专门为大学教师设计课程。请根据用户提供的课程主题和关键词，生成一份详细的教学材料。\n你的回答必须遵循以下JSON格式，不要添加任何额外的解释或说明文字：\n{\n  \"syllabus\": \"一个详细的、分章节的教学大纲，使用Markdown格式。\",\n  \"keyPoints\": \"课程的重点和难点分析，使用Markdown格式。\",\n  \"exercises\": \"3-5个相关的课后习题建议，使用Markdown格式。\",\n  \"keyFormulas\": \"提取课程中的核心公式，以LaTeX数组格式提供，例如：[\\\\\"E=mc^2\\\\\", \\\\\"F=ma\\\\\"]。\",\n  \"fullCourseDesign\": \"一份完整的课程设计文档，包含课程简介、教学目标、教学安排、考核方式和教学资源，使用Markdown格式。\"\n}`;

    const userPrompt = `课程主题: ${values.topic}\n关键词: ${values.keywords || ''}`;

    const llmResponse = await callLLM([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    if (llmResponse.success) {
      try {
        const parsedResult = JSON.parse(llmResponse.data);
        setResult(parsedResult);
        message.success('课程设计已生成！');
      } catch (e) {
        console.error("Failed to parse LLM response:", e);
        setError("AI返回的数据格式不正确，无法解析。请稍后重试。");
        message.error("AI返回的数据格式不正确，无法解析。");
      }
    } else {
      setError(llmResponse.error);
      message.error(llmResponse.error);
    }

    setLoading(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      message.success('已成功复制到剪贴板');
    }, (err) => {
      message.error('复制失败');
      console.error('Could not copy text: ', err);
    });
  };

  const exportToMarkdown = () => {
    if (!result) {
      message.warning('请先生成教学材料');
      return;
    }

    const fileName = `课程设计_${new Date().toLocaleDateString().replace(/\//g, '-')}.md`;
    let content = '';
    if (result.fullCourseDesign) {
      content += `# 完整课程设计\n\n${result.fullCourseDesign}\n\n`;
    }
    content += `# 教学大纲\n\n${result.syllabus}\n\n# 重点难点分析\n\n${result.keyPoints}\n\n# 课后习题建议\n\n${result.exercises}`;
    
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    saveAs(blob, fileName);
    message.success('Markdown文件导出成功');
  };

  const exportToWord = () => {
    if (!result) {
      message.warning('请先生成教学材料');
      return;
    }

    try {
      const fullDesignHtml = marked(result.fullCourseDesign || '');
      const syllabusHtml = marked(result.syllabus || '');
      const keyPointsHtml = marked(result.keyPoints || '');
      const exercisesHtml = marked(result.exercises || '');

      let htmlTemplate = '';
      if (result.fullCourseDesign) {
        htmlTemplate += `
        <div class="section">
          <h1>完整课程设计</h1>
          <div class="content">${fullDesignHtml}</div>
        </div>
        `;
      }
      htmlTemplate += `
        <div class="section">
          <h1>教学大纲</h1>
          <div class="content">${syllabusHtml}</div>
        </div>
        <div class="section">
          <h1>重点难点分析</h1>
          <div class="content">${keyPointsHtml}</div>
        </div>
        <div class="section">
          <h1>课后习题建议</h1>
          <div class="content">${exercisesHtml}</div>
        </div>
      `;

      const fullHtml = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office'
              xmlns:w='urn:schemas-microsoft-com:office:word'
              xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset='utf-8'>
          <title>课程设计</title>
          <style>
            body {
              font-family: 'Dengxian', '等线', 'Microsoft YaHei', '微软雅黑', sans-serif;
              font-size: 12pt;
              line-height: 1.75;
              margin: 2.5cm 2cm;
            }
            .section { margin-bottom: 28px; page-break-after: always; }
            .section:last-child { page-break-after: auto; }
            h1 { font-size: 22pt; font-weight: bold; color: #2E74B5; border-bottom: 2px solid #2E74B5; padding-bottom: 8px; margin-bottom: 20px; }
            h2 { font-size: 16pt; font-weight: bold; color: #333; margin-top: 24px; margin-bottom: 12px; }
            h3 { font-size: 14pt; font-weight: bold; color: #444; margin-top: 20px; margin-bottom: 10px; }
            p { margin: 0 0 12px 0; text-align: justify; }
            strong, b { font-weight: bold; color: #BF4C15; }
            ul, ol { margin-top: 0; margin-bottom: 12px; padding-left: 30px; }
            li { margin-bottom: 8px; }
            a { color: #0563C1; text-decoration: none; }
            a:hover { text-decoration: underline; }
            pre, code { font-family: 'Consolas', 'Courier New', monospace; background-color: #F3F3F3; border: 1px solid #DDD; border-radius: 4px; padding: 10px; font-size: 10pt; white-space: pre-wrap; word-wrap: break-word; }
          </style>
        </head>
        <body>${htmlTemplate}</body>
        </html>
      `;
      
      const blob = new Blob(['\ufeff', fullHtml], { type: 'application/msword' });
      saveAs(blob, `课程设计_${new Date().toLocaleDateString().replace(/\//g, '-')}.doc`);
      message.success('Word文档已成功导出！');
    } catch (error) {
      console.error('导出Word文档时出错:', error);
      message.error('导出Word文档失败，请查看控制台获取更多信息。');
    }
  };

  const exportItems = [
    { key: 'markdown', label: '导出为Markdown', icon: <FileMarkdownOutlined />, onClick: exportToMarkdown },
    { key: 'word', label: '导出为Word', icon: <FileWordOutlined />, onClick: exportToWord },
  ];

  const renderResultCard = (title, icon, content, placeholder, extra = null) => (
    <Card title={<Space>{icon}{title}</Space>} bordered={false} className="result-card" extra={extra}>
      {content ? (
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      ) : (
        <div className="placeholder-content">
          <Text type="secondary">{placeholder}</Text>
        </div>
      )}
    </Card>
  );

  return (
    <div className="course-design-assistant-container">
      <div className="header-section">
        <Avatar size={80} src={defaultImage} />
        <div className="header-text">
          <Title level={3} style={{ margin: 0 }}>知书达鲤 - 课程设计助手</Title>
          <Paragraph style={{ margin: 0, marginTop: 8 }}>
            只需输入课程主题和关键词，AI 将为您精心打造一份完整的教学设计方案，涵盖教学大纲、重点难点、课后习题等，助您高效备课。
          </Paragraph>
        </div>
      </div>
      
      <Row gutter={32}>
        <Col xs={24} md={8}>
          <Card title="课程信息输入" bordered={false} className="form-card">
            <Form onFinish={onFinish} layout="vertical">
              <Form.Item name="topic" label="课程主题" rules={[{ required: true, message: '请输入课程主题!' }]}>
                <Input placeholder="例如：机器学习入门" />
              </Form.Item>
              <Form.Item name="keywords" label="关键词 (可选)" help="多个关键词请用逗号分隔">
                <Input placeholder="例如：线性回归, 逻辑回归" />
              </Form.Item>
              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" loading={loading} block>
                    {loading ? '正在生成...' : '生成教学材料'}
                  </Button>
                  {result && (
                    <Dropdown menu={{ items: exportItems }} placement="bottomRight">
                      <Button icon={<DownloadOutlined />}>导出文档</Button>
                    </Dropdown>
                  )}
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>
        <Col xs={24} md={16}>
          <Spin spinning={loading} tip="AI 正在努力生成中..." size="large" style={{ width: '100%' }}>
            {error && <Alert message="生成出错" description={error} type="error" showIcon style={{ marginBottom: 24 }} />}
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {renderResultCard("完整课程设计", <FileTextOutlined />, result?.fullCourseDesign, "这里将展示AI生成的完整课程设计方案，包括课程简介、目标、安排等。")}
              {renderResultCard("教学大纲", <BookOutlined />, result?.syllabus, "这里将展示AI生成的详细章节教学大纲。")}
              {renderResultCard("重点难点分析", <BulbOutlined />, result?.keyPoints, "这里将展示AI分析的课程重点与难点。")}
              {renderResultCard("课后习题建议", <ExperimentOutlined />, result?.exercises, "这里将展示AI建议的相关课后练习题。")}
              <Card title={<Space><CodeOutlined />重点公式</Space>} bordered={false} className="result-card" extra={
                result?.keyFormulas && (
                  <Button icon={<CopyOutlined />} onClick={() => copyToClipboard(result.keyFormulas.join('\n'))}>
                    复制LaTeX
                  </Button>
                )
              }>
                {result?.keyFormulas ? (
                  <ul>
                    {result.keyFormulas.map((formula, index) => (
                      <li key={index}>{`$$${formula}$$`}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="placeholder-content">
                    <Text type="secondary">这里将展示AI提取的核心数学公式 (LaTeX格式)。</Text>
                  </div>
                )}
              </Card>
            </Space>
          </Spin>
        </Col>
      </Row>
    </div>
  );
};

export default CourseDesignAssistant;