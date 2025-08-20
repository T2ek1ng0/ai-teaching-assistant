import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Space, Spin, message, Alert } from 'antd';
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
          <Button type="primary" htmlType="submit" loading={loading}>
            {loading ? '正在生成...' : '生成教学材料'}
          </Button>
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
