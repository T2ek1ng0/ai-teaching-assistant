import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Typography } from 'antd';
import './HomePage.css';

const { Title, Paragraph } = Typography;

const HomePage = () => {
  return (
    <div className="home-page">
      <div className="home-content">
        <Title level={2}>欢迎使用 AI 助教系统</Title>
        <Paragraph>
          本系统旨在利用人工智能技术，辅助教师进行课程设计、作业批改，并为学生提供智能化的学习工具。
        </Paragraph>
        <Card title="快速开始：系统使用指南" style={{ marginTop: '20px' }}>
          <Paragraph>
            为了帮助您快速上手，我们准备了一份详细的系统使用指南。
          </Paragraph>
          <Link to="/guide">
            <button className="guide-button">阅读指南</button>
          </Link>
        </Card>
      </div>
    </div>
  );
};

export default HomePage;