import React from 'react';
import { Typography, Card } from 'antd';
import './AboutUs.css';

const { Title, Paragraph } = Typography;

const AboutUs = () => {
  return (
    <div className="about-us-container">
      <Title level={2}>关于我们</Title>
      <Card>
        <Paragraph>
          <Title level={4}>AI 助教系统</Title>
          这是一个利用前沿人工智能技术，旨在革新教学模式、提升学习效率的智能辅助平台。
        </Paragraph>
        <Paragraph>
          <strong>版本:</strong> 1.0.0
        </Paragraph>
        <Paragraph>
          <strong>核心功能:</strong>
          <ul>
            <li>为教师提供课程设计、作业批改的智能辅助。</li>
            <li>为学生提供课程预习、自学探索、智能答疑的个性化支持。</li>
          </ul>
        </Paragraph>
        <Paragraph>
          我们致力于通过技术创新，让教育变得更加智能、高效和个性化。
        </Paragraph>
      </Card>
    </div>
  );
};

export default AboutUs;