import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Space, Spin, message, Alert } from 'antd';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { callLLM } from '../utils/llm';

const { Title, Paragraph } = Typography;

const CourseSelfLearningAssistant = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const onFinish = async (values) => {
    console.log('Received values of form: ', values);
    setLoading(true);
    setResult(null);
    setError(null);

    const systemPrompt = `你是一位顶级的学习专家，请根据用户提供的课程主题和关键词，为用户提供一份自学指南。
你的回答必须遵循以下JSON格式，不要添加任何额外的解释或说明文字：
{
  "knowledgePoints": "总结相关的核心知识点，使用Markdown格式。",
  "onlineCourses": "推荐一些高质量的在线课程（如 Coursera、edX、Bilibili 上的课程），使用Markdown格式。",
  "websites": "推荐一些有用的学习网站和资源，使用Markdown格式。"
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
      <Title level={4}>课程预习/自学助手</Title>
      <Paragraph>请输入课程主题和关键词，AI将为您总结知识点、推荐网课和学习网站。</Paragraph>
      
      <Form onFinish={onFinish} layout="vertical">
        <Form.Item
          name="topic"
          label="课程主题"
          rules={[{ required: true, message: '请输入课程主题!' }]}
        >
          <Input placeholder="例如：Python数据分析" />
        </Form.Item>
        <Form.Item
          name="keywords"
          label="关键词"
          rules={[{ required: true, message: '请输入关键词!' }]}
        >
          <Input placeholder="例如：Pandas, NumPy, Matplotlib" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            {loading ? '正在生成...' : '生成自学指南'}
          </Button>
        </Form.Item>
      </Form>

      {error && <Alert message="错误" description={error} type="error" showIcon style={{ marginBottom: 24 }} />}
      
      <Spin spinning={loading} tip="AI 正在努力生成中..." size="large">
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Card title="核心知识点">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {result?.knowledgePoints || '这里将显示总结的核心知识点...'}
            </ReactMarkdown>
          </Card>
          <Card title="在线课程推荐">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {result?.onlineCourses || '这里将显示推荐的在线课程...'}
            </ReactMarkdown>
          </Card>
          <Card title="学习网站推荐">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {result?.websites || '这里将显示推荐的学习网站...'}
            </ReactMarkdown>
          </Card>
        </Space>
      </Spin>
    </div>
  );
};

export default CourseSelfLearningAssistant;
