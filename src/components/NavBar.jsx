import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Dropdown } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import './NavBar.css';
import logo from '/favicon.png';

const teacherMenuItems = [
  { key: '1', label: <Link to="/course-design">课程设计</Link> },
  { key: '2', label: <Link to="/grade-assignments">批改学生作业</Link> },
];

const studentMenuItems = [
  { key: '1', label: <Link to="/course-preview">课程预习</Link> },
  { key: '2', label: <Link to="/self-learning">自学助手</Link> },
  { key: '3', label: <Link to="/chatbot">智能答疑机器人</Link> },
];

const settingsMenuItems = [
  { key: '1', label: <Link to="/settings">API 配置</Link> },
  { key: '2', label: <Link to="/memory-management">记忆管理</Link> },
  { key: '3', label: <Link to="/about-us">关于我们</Link> },
];

const NavBar = () => {
  const [openDropdown, setOpenDropdown] = useState(null);

  const handleOpenChange = (dropdown, open) => {
    setOpenDropdown(open ? dropdown : null);
  };

  const getArrowClass = (dropdown) => {
    return openDropdown === dropdown ? 'arrow-up' : 'arrow-down';
  };

  return (
    <div className="navbar">
      <div className="logo">
        <img src={logo} alt="logo" className="logo-img" />
        <Link to="/">AI 助教</Link>
      </div>
      <div className="nav-menu">
        <Dropdown menu={{ items: teacherMenuItems }} onOpenChange={(open) => handleOpenChange('teacher', open)}>
          <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
            教师专栏 <DownOutlined className={getArrowClass('teacher')} />
          </a>
        </Dropdown>
        <Dropdown menu={{ items: studentMenuItems }} onOpenChange={(open) => handleOpenChange('student', open)}>
          <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
            学生必备 <DownOutlined className={getArrowClass('student')} />
          </a>
        </Dropdown>
        <Dropdown menu={{ items: settingsMenuItems }} onOpenChange={(open) => handleOpenChange('settings', open)}>
          <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
            设置 <DownOutlined className={getArrowClass('settings')} />
          </a>
        </Dropdown>
      </div>
    </div>
  );
};

export default NavBar;