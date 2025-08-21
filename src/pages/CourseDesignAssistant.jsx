import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Space, Spin, message, Alert, Radio, Dropdown } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph as DocxParagraph, HeadingLevel, TextRun } from 'docx';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { callLLM } from '../utils/llm';

const { Title, Paragraph } = Typography;

const CourseDesignAssistant = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const onFinish = async (values) => {
    console.log('Received values of form: ', values);
    setLoading(true);
    setResult(null);
    setError(null);

    const systemPrompt = `你是一位顶级的教学设计师，专门为大学教师设计课程。请根据用户提供的课程主题和关键词，生成一份详细的教学材料。
你的回答必须遵循以下JSON格式，不要添加任何额外的解释或说明文字：
{
  "syllabus": "一个详细的、分章节的教学大纲，使用Markdown格式。",
  "keyPoints": "课程的重点和难点分析，使用Markdown格式。",
  "exercises": "3-5个相关的课后习题建议，使用Markdown格式。"
}`;

    const userPrompt = `课程主题: ${values.topic}\n关键词: ${values.keywords}`;

    const llmResponse = await callLLM([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    if (llmResponse.success) {
      try {
        const parsedResult = JSON.parse(llmResponse.data);
        setResult(parsedResult);
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

  // 导出为Markdown文件
  const exportToMarkdown = () => {
    if (!result) {
      message.warning('请先生成教学材料');
      return;
    }

    const fileName = `课程设计_${new Date().toLocaleDateString().replace(/\//g, '-')}.md`;
    const content = `# 教学大纲\n\n${result.syllabus}\n\n# 重点难点分析\n\n${result.keyPoints}\n\n# 课后习题建议\n\n${result.exercises}`;
    
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    saveAs(blob, fileName);
    message.success('Markdown文件导出成功');
  };

  // 将Markdown文本转换为简单的纯文本
  const convertMarkdownToPlainText = (markdown) => {
    // 简单替换一些常见的Markdown语法
    return markdown
      .replace(/#{1,6}\s+/g, '') // 移除标题符号
      .replace(/\*\*(.*?)\*\*/g, '$1') // 移除粗体
      .replace(/\*(.*?)\*/g, '$1') // 移除斜体
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // 替换链接为纯文本
      .replace(/```[\s\S]*?```/g, '') // 移除代码块
      .replace(/`(.*?)`/g, '$1'); // 移除内联代码
  };

  // 创建段落数组，处理多行文本
  const createParagraphs = (text, isHeading = false) => {
    const lines = text.split('\n');
    return lines.map(line => {
      if (!line.trim()) return new DocxParagraph({ text: '' }); // 空行
      
      if (isHeading) {
        return new DocxParagraph({
          text: line,
          heading: HeadingLevel.HEADING_1,
        });
      }
      
      return new DocxParagraph({
        children: [
          new TextRun({
            text: line,
          }),
        ],
      });
    });
  };

  // 导出为HTML文件（替代Word文档）
  const exportToHTML = () => {
    if (!result) {
      message.warning('请先生成教学材料');
      return;
    }

    try {
      // 创建HTML内容
      const htmlContent = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>课程设计</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 {
      color: #005A9C;
      border-bottom: 1px solid #eee;
      padding-bottom: 10px;
    }
    h2 {
      color: #333;
      margin-top: 20px;
    }
    pre {
      background-color: #f5f5f5;
      padding: 10px;
      border-radius: 5px;
      overflow-x: auto;
    }
  </style>
</head>
<body>
  <h1>教学大纲</h1>
  <div id="syllabus">${result.syllabus.replace(/\n/g, '<br>')}</div>
  
  <h1>重点难点分析</h1>
  <div id="keyPoints">${result.keyPoints.replace(/\n/g, '<br>')}</div>
  
  <h1>课后习题建议</h1>
  <div id="exercises">${result.exercises.replace(/\n/g, '<br>')}</div>
</body>
</html>
      `;
      
      // 创建Blob并下载
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      saveAs(blob, `课程设计_${new Date().toLocaleDateString().replace(/\//g, '-')}.html`);
      message.success('HTML文档导出成功');
    } catch (error) {
      console.error('导出HTML文档失败:', error);
      message.error('导出HTML文档失败，请稍后重试');
    }
  };

  // 导出菜单项
  const exportItems = [
    {
      key: 'markdown',
      label: '导出为Markdown',
      onClick: exportToMarkdown,
    },
    {
      key: 'html',
      label: '导出为HTML',
      onClick: exportToHTML,
    },
  ];

  return (
    <div>
      <Title level={4}>课程设计助手</Title>
      <Paragraph>请输入课程主题和关键词，AI将为您生成教学大纲、重点难点分析和课后习题建议。</Paragraph>
      
      <Form onFinish={onFinish} layout="vertical">
        <Form.Item
          name="topic"
          label="课程主题"
          rules={[{ required: true, message: '请输入课程主题!' }]}
        >
          <Input placeholder="例如：机器学习入门" />
        </Form.Item>
        <Form.Item
          name="keywords"
          label="关键词"
          rules={[{ required: true, message: '请输入关键词!' }]}
        >
          <Input placeholder="例如：线性回归, 逻辑回归, 决策树" />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
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

      {error && <Alert message="错误" description={error} type="error" showIcon style={{ marginBottom: 24 }} />}
      
      <Spin spinning={loading} tip="AI 正在努力生成中..." size="large">
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Card title="教学大纲">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {result?.syllabus || '这里将显示生成的教学大纲...'}
            </ReactMarkdown>
          </Card>
          <Card title="重点难点分析">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {result?.keyPoints || '这里将显示生成的重点难点分析...'}
            </ReactMarkdown>
          </Card>
          <Card title="课后习题建议">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {result?.exercises || '这里将显示生成的课后习题建议...'}
            </ReactMarkdown>
          </Card>
        </Space>
      </Spin>
    </div>
  );
};

export default CourseDesignAssistant;
