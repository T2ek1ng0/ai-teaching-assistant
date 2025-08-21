import React, { useState } from 'react';
import { Layout, Menu, ConfigProvider, Typography } from 'antd';

import CourseDesignAssistant from './pages/CourseDesignAssistant';
import CourseSelfLearningAssistant from './pages/CourseSelfLearningAssistant';
import AssignmentGrader from './pages/AssignmentGrader';
import Chatbot from './pages/Chatbot';
import Settings from './pages/Settings';
import MemoryManager from './pages/MemoryManager';

const { Header, Content, Footer, Sider } = Layout;
const { Title } = Typography;

const App = () => {
  const [selectedKey, setSelectedKey] = useState('1');

  const renderContent = () => {
    switch (selectedKey) {
      case '1':
        return <CourseDesignAssistant />;
      case '2':
        return <CourseSelfLearningAssistant />;
      case '3':
        return <AssignmentGrader />;
      case '4':
        return <Chatbot />;
      case '5':
        return <Settings />;
      case '6':
        return <MemoryManager />;
      default:
        return <CourseDesignAssistant />;
    }
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#005A9C', // SCUT Blue
        },
      }}
    >
      <Layout style={{ minHeight: '100vh' }}>
        <Sider collapsible>
          <div style={{ height: '32px', margin: '16px', background: 'rgba(255, 255, 255, 0.2)', borderRadius: '6px' }} />
          <Menu 
            theme="dark" 
            selectedKeys={[selectedKey]} 
            mode="inline"
            onClick={(e) => setSelectedKey(e.key)}
          >
            <Menu.Item key="1">
              课程设计助手
            </Menu.Item>
            <Menu.Item key="2">
              课程预习/自学助手
            </Menu.Item>
            <Menu.Item key="3">
              作业智能批改
            </Menu.Item>
            <Menu.Item key="4">
              智能答疑机器人
            </Menu.Item>
            <Menu.Item key="5">
              API 设置
            </Menu.Item>
            <Menu.Item key="6">
              记忆管理
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout>
          <Header style={{ background: '#fff', padding: '0 24px' }}>
            <Title level={3} style={{ margin: '16px 0' }}>AI 助教系统</Title>
          </Header>
          <Content style={{ margin: '24px 16px 0' }}>
            <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
              {renderContent()}
            </div>
          </Content>
          <Footer style={{ textAlign: 'center' }}>
            AI Teaching Assistant ©2024 Created by CodeBuddy
          </Footer>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default App;

