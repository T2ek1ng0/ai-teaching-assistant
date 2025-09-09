import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Row, Col, Typography, Avatar } from 'antd';
import { 
  EditOutlined, 
  CheckSquareOutlined, 
  MessageOutlined, 
  ReadOutlined, 
  BookOutlined,
  BulbOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import './HomePage.css';
import defaultImage from '../assets/default.jpg';

const { Title, Paragraph, Text } = Typography;

const features = [
  {
    title: '课程设计',
    description: '快速生成教学大纲、重点难点和习题。',
    icon: <EditOutlined style={{ fontSize: '32px', color: '#1890ff' }} />,
    link: '/course-design',
  },
  {
    title: '作业批改',
    description: '上传作业，AI 辅助评分并提供评语。',
    icon: <CheckSquareOutlined style={{ fontSize: '32px', color: '#52c41a' }} />,
    link: '/grade-assignments',
  },
  {
    title: '智能问答',
    description: '与“鲤工仔”互动，解答您的课程疑问。',
    icon: <MessageOutlined style={{ fontSize: '32px', color: '#faad14' }} />,
    link: '/chatbot',
  },
  {
    title: '题库中心',
    description: '趣味与专业题库，检验您的学习成果。',
    icon: <ReadOutlined style={{ fontSize: '32px', color: '#722ed1' }} />,
    link: '/question-bank',
  },
  {
    title: '自学助手',
    description: '您的个性化学习伙伴，帮您预习和复习。',
    icon: <BulbOutlined style={{ fontSize: '32px', color: '#eb2f96' }} />,
    link: '/self-learning',
  },
  {
    title: '入门指南',
    description: '快速了解本系统的所有强大功能。',
    icon: <BookOutlined style={{ fontSize: '32px', color: '#13c2c2' }} />,
    link: '/guide',
  },
];

const WelcomeHeader = () => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return "夜深了，注意休息哦！";
    if (hour < 12) return "早上好，新的一天，元气满满！";
    if (hour < 14) return "中午好，别忘了午休哦！";
    if (hour < 18) return "下午好，继续加油！";
    return "晚上好，今天收获如何？";
  };

  return (
    <div className="welcome-header">
      <Avatar size={88} src={defaultImage} className="welcome-avatar" />
      <div>
        <Title level={2} style={{ margin: 0, color: '#fff', textShadow: '1px 1px 3px rgba(0,0,0,0.4)' }}>
          {getGreeting()}
        </Title>
        <Paragraph style={{ margin: '8px 0 0', color: 'rgba(255, 255, 255, 0.85)', fontSize: '16px' }}>
          欢迎使用「知书达鲤」，我是您的专属AI助教“鲤工仔”。
        </Paragraph>
      </div>
    </div>
  );
};

const tips = [
  {
    title: '善用“智能问答”',
    content: '遇到任何课程难题，随时向“鲤工仔”提问，它会为你提供即时、详细的解答。',
    icon: <MessageOutlined style={{ fontSize: '24px', color: '#faad14' }} />,
  },
  {
    title: '定制你的学习路径',
    content: '在“自学助手”中输入你的学习目标，AI会为你生成个性化的学习计划和资料。',
    icon: <BulbOutlined style={{ fontSize: '24px', color: '#eb2f96' }} />,
  },
  {
    title: '一键生成教学大纲',
    content: '“课程设计”功能可以帮你快速构建课程框架，节省大量备课时间。',
    icon: <EditOutlined style={{ fontSize: '24px', color: '#1890ff' }} />,
  },
];

const TipsSection = () => (
  <div className="tips-section">
    <Title level={3} className="tips-title">
      <InfoCircleOutlined style={{ marginRight: '12px' }} />
      使用小贴士
    </Title>
    <Row gutter={[24, 24]}>
      {tips.map((tip, index) => (
        <Col xs={24} md={8} key={index}>
          <Card className="tip-card">
            <div className="tip-card-content">
              {tip.icon}
              <div className="tip-text">
                <Title level={5} style={{ margin: '0 0 8px 0' }}>{tip.title}</Title>
                <Paragraph style={{ margin: 0 }}>{tip.content}</Paragraph>
              </div>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  </div>
);

const HomePage = () => {
  return (
    <div className="home-page-container">
      <WelcomeHeader />
      <div className="features-grid">
        <Row gutter={[24, 24]}>
          {features.map((feature, index) => (
            <Col xs={24} sm={12} md={8} key={index}>
              <Link to={feature.link}>
                <Card hoverable className="feature-card">
                  <div className="feature-card-content">
                    {feature.icon}
                    <div className="feature-text">
                      <Title level={5} style={{ margin: 0 }}>{feature.title}</Title>
                      <Text type="secondary">{feature.description}</Text>
                    </div>
                  </div>
                </Card>
              </Link>
            </Col>
          ))}
        </Row>
      </div>
      <TipsSection />
    </div>
  );
};

export default HomePage;