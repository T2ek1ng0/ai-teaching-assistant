import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Layout, ConfigProvider } from 'antd';

import NavBar from './components/NavBar';
import FloatingBot from './components/FloatingBot';
import HomePage from './pages/HomePage';
import Guide from './pages/Guide';
import CourseDesignAssistant from './pages/CourseDesignAssistant';
import CourseSelfLearningAssistant from './pages/CourseSelfLearningAssistant';
import AssignmentGrader from './pages/AssignmentGrader';
import Chatbot from './pages/Chatbot';
import Settings from './pages/Settings';
import MemoryManager from './pages/MemoryManager';
import AboutUs from './pages/AboutUs';
import QuestionBank from './pages/QuestionBank/QuestionBank';

const { Content, Footer } = Layout;

const App = () => {
  useEffect(() => {
    document.body.classList.add('app-background');
    return () => {
      document.body.classList.remove('app-background');
    };
  }, []);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#005A9C',
        },
      }}
    >
      <Router basename="/ai-teaching-assistant">
        <Layout style={{ minHeight: '100vh', background: 'transparent' }}>
          <NavBar />
          <Content style={{ padding: '24px' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              padding: 24,
              minHeight: 'calc(100vh - 134px)',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/guide" element={<Guide />} />
                <Route path="/course-design" element={<CourseDesignAssistant />} />
                <Route path="/grade-assignments" element={<AssignmentGrader />} />
                <Route path="/course-preview" element={<CourseSelfLearningAssistant />} />
                <Route path="/self-learning" element={<CourseSelfLearningAssistant />} />
                <Route path="/chatbot" element={<Chatbot />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/memory-management" element={<MemoryManager />} />
                <Route path="/about-us" element={<AboutUs />} />
                <Route path="/question-bank" element={<QuestionBank />} />
              </Routes>
            </div>
          </Content>
          <FloatingBot />
          <Footer style={{ textAlign: 'center', color: '#fff', textShadow: '1px 1px 3px rgba(0,0,0,0.6)' }}>
            知书达鲤 ©2024 Created by CodeBuddy
          </Footer>
        </Layout>
      </Router>
    </ConfigProvider>
  );
};

export default App;

