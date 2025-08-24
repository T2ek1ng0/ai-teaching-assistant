import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button, Popover } from 'antd';
import { RobotOutlined, CloseOutlined } from '@ant-design/icons';
import Draggable from 'react-draggable';
import './FloatingBot.css';

const FloatingBot = () => {
  const [visible, setVisible] = useState(true);
  const nodeRef = useRef(null);

  if (!visible) {
    return null;
  }

  const content = (
    <div>
      <p>需要帮助吗？</p>
      <Link to="/guide">
        <Button type="link">查看入门指南</Button>
      </Link>
      <br />
      <Link to="/chatbot">
        <Button type="link">跳转到智能答疑机器人</Button>
      </Link>
    </div>
  );

  return (
    <Draggable nodeRef={nodeRef}>
      <div ref={nodeRef} className="floating-bot">
        <Popover content={content} title="AI 助教" trigger="click">
          <Button type="primary" shape="circle" icon={<RobotOutlined />} size="large" />
        </Popover>
        <Button
          type="text"
          icon={<CloseOutlined />}
          onClick={() => setVisible(false)}
          className="close-button"
        />
      </div>
    </Draggable>
  );
};

export default FloatingBot;
