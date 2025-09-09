import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, Space, Spin, message, Alert, Avatar, Row, Col, Drawer, List, Popconfirm } from 'antd';
import { BookOutlined, PlaySquareOutlined, GlobalOutlined, HistoryOutlined, DeleteOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { callLLM } from '../utils/llm';
import { supabase } from '../utils/supabase';
import defaultImage from '../assets/default.jpg';
import './CourseSelfLearningAssistant.css';

const { Title, Paragraph, Text } = Typography;

const CourseSelfLearningAssistant = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [form] = Form.useForm();

  // History State
  const [historyVisible, setHistoryVisible] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const saveHistory = async (topic, keywords, resultData) => {
    const { error } = await supabase
      .from('self_learning_history')
      .insert([{ topic, keywords: keywords || '', result: resultData }]);
    if (error) {
      message.error('保存历史记录失败: ' + error.message);
    }
  };

  const onFinish = async (values) => {
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
        await saveHistory(values.topic, values.keywords, parsedResult);
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

  const fetchHistory = async () => {
    setHistoryLoading(true);
    const { data, error } = await supabase
      .from('self_learning_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) {
      message.error('加载历史记录失败: ' + error.message);
    } else {
      setHistoryData(data);
    }
    setHistoryLoading(false);
  };

  const showHistory = () => {
    fetchHistory();
    setHistoryVisible(true);
  };

  const handleHistoryItemClick = (item) => {
    form.setFieldsValue({ topic: item.topic, keywords: item.keywords });
    setResult(item.result);
    setHistoryVisible(false);
    message.success(`已加载历史记录：${item.topic}`);
  };

  const handleDeleteHistory = async (id) => {
    const { error } = await supabase.from('self_learning_history').delete().match({ id });
    if (error) {
      message.error('删除失败: ' + error.message);
    } else {
      message.success('删除成功');
      fetchHistory(); // Refresh list
    }
  };

  const renderResultCard = (title, icon, content, placeholder) => (
    <Card title={<Space>{icon}{title}</Space>} bordered={false} className="result-card">
      {content ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown> : <div className="placeholder-content"><Text type="secondary">{placeholder}</Text></div>}
    </Card>
  );

  return (
    <div className="self-learning-assistant-container">
      <div className="header-section">
        <Avatar size={80} src={defaultImage} />
        <div className="header-text">
          <Title level={3} style={{ margin: 0 }}>知书达鲤 - 课程预习与自学助手</Title>
          <Paragraph style={{ margin: 0, marginTop: 8 }}>
            输入您感兴趣的课程主题，AI将为您量身定制一份自学指南，所有生成记录都会自动保存，方便您随时查阅。
          </Paragraph>
        </div>
      </div>
      
      <Row gutter={32}>
        <Col xs={24} md={8}>
          <Card title="输入学习主题" bordered={false} className="form-card">
            <Form form={form} onFinish={onFinish} layout="vertical">
              <Form.Item name="topic" label="课程主题" rules={[{ required: true, message: '请输入课程主题!' }]}>
                <Input placeholder="例如：Python数据分析" />
              </Form.Item>
              <Form.Item name="keywords" label="关键词 (可选)" help="多个关键词请用逗号分隔">
                <Input placeholder="例如：Pandas, NumPy, Matplotlib" />
              </Form.Item>
              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    {loading ? '正在生成...' : '生成自学指南'}
                  </Button>
                  <Button icon={<HistoryOutlined />} onClick={showHistory}>
                    历史记录
                  </Button>
                </Space>
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

      <Drawer
        title="历史记录"
        placement="right"
        onClose={() => setHistoryVisible(false)}
        visible={historyVisible}
        width={400}
      >
        <Spin spinning={historyLoading}>
          <List
            itemLayout="horizontal"
            dataSource={historyData}
            renderItem={item => (
              <List.Item
                actions={[
                  <Popconfirm title="确定删除吗?" onConfirm={() => handleDeleteHistory(item.id)} okText="删除" cancelText="取消">
                    <Button type="text" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                ]}
              >
                <List.Item.Meta
                  title={<a onClick={() => handleHistoryItemClick(item)}>{item.topic}</a>}
                  description={`创建于: ${new Date(item.created_at).toLocaleString()}`}
                />
              </List.Item>
            )}
          />
        </Spin>
      </Drawer>
    </div>
  );
};

export default CourseSelfLearningAssistant;