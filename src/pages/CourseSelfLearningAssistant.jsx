import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Space, Spin, message, Alert, Avatar, Row, Col } from 'antd';
import { BookOutlined, PlaySquareOutlined, GlobalOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { callLLM } from '../utils/llm';
import defaultImage from '../assets/default.jpg';
import './CourseSelfLearningAssistant.css';

const { Title, Paragraph, Text } = Typography;

const CourseSelfLearningAssistant = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const onFinish = async (values) => {
    console.log('Received values of form: ', values);
    setLoading(true);
    setResult(null);
    setError(null);

    const systemPrompt = `你是一位顶级的学习专家，请根据用户提供的课程主题和关键词，为用户提供一份自学指南。\n你的回答必须遵循以下JSON格式，不要添加任何额外的解释或说明文字：\n{\n  \"knowledgePoints\": \"总结相关的核心知识点，使用Markdown格式。\",\n  \"onlineCourses\": \"推荐一些高质量的在线课程（如 Coursera、edX、Bilibili 上的课程），使用Markdown格式。\",\n  \"websites\": \"推荐一些有用的学习网站和资源，使用Markdown格式。\"\n}`;

    const userPrompt = `课程主题: ${values.topic}\n关键词: ${values.keywords || ''}`;

    const llmResponse = await callLLM([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    if (llmResponse.success) {
      try {
        const parsedResult = JSON.parse(llmResponse.data);
        setResult(parsedResult);
        message.success('自学指南已生成！');
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

  const renderResultCard = (title, icon, content, placeholder) => (
    <Card title={<Space>{icon}{title}</Space>} bordered={false} className="result-card">
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
    <div className="self-learning-assistant-container">
      <div className="header-section">
        <Avatar size={80} src={defaultImage} />
        <div className="header-text">
          <Title level={3} style={{ margin: 0 }}>知书达鲤 - 课程预习与自学助手</Title>
          <Paragraph style={{ margin: 0, marginTop: 8 }}>
            输入您感兴趣的课程主题，AI将为您量身定制一份自学指南，包括核心知识点、在线课程和优质学习网站，助您开启高效学习之旅。
          </Paragraph>
        </div>
      </div>
      
      <Row gutter={32}>
        <Col xs={24} md={8}>
          <Card title="输入学习主题" bordered={false} className="form-card">
            <Form onFinish={onFinish} layout="vertical">
              <Form.Item name="topic" label="课程主题" rules={[{ required: true, message: '请输入课程主题!' }]}>
                <Input placeholder="例如：Python数据分析" />
              </Form.Item>
              <Form.Item name="keywords" label="关键词 (可选)" help="多个关键词请用逗号分隔">
                <Input placeholder="例如：Pandas, NumPy, Matplotlib" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} block>
                  {loading ? '正在生成...' : '生成自学指南'}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
        <Col xs={24} md={16}>
          <Spin spinning={loading} tip="AI 正在努力生成中..." size="large" style={{ width: '100%' }}>
            {error && <Alert message="生成出错" description={error} type="error" showIcon style={{ marginBottom: 24 }} />}
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {renderResultCard("核心知识点", <BookOutlined />, result?.knowledgePoints, "这里将展示AI总结的核心知识点，助您快速掌握课程精髓。")}
              {renderResultCard("在线课程推荐", <PlaySquareOutlined />, result?.onlineCourses, "这里将展示AI推荐的高质量在线视频课程。")}
              {renderResultCard("学习网站推荐", <GlobalOutlined />, result?.websites, "这里将展示AI推荐的相关学习网站和文档资源。")}
            </Space>
          </Spin>
        </Col>
      </Row>
    </div>
  );
};

export default CourseSelfLearningAssistant;