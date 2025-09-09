import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, Popover } from 'antd';
import { MinusOutlined } from '@ant-design/icons';
import Draggable from 'react-draggable';
import './FloatingBot.css';

import defaultImage from '../assets/default.jpg';
import sleepImage from '../assets/sleep.jpg';
import studyImage1 from '../assets/study1.jpg';
import studyImage2 from '../assets/study2.jpg';
import studyImage3 from '../assets/study3.jpg';

const studyImages = [studyImage1, studyImage2, studyImage3];

const FloatingBot = () => {
  const [minimized, setMinimized] = useState(false);
  const [currentImage, setCurrentImage] = useState(defaultImage);
  const [isSleeping, setIsSleeping] = useState(false);
  const nodeRef = useRef(null);
  const idleTimerRef = useRef(null);

  // Effect for Idle Detection
  useEffect(() => {
    const handleActivity = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (isSleeping) setIsSleeping(false); // Wake up

      idleTimerRef.current = setTimeout(() => {
        setIsSleeping(true); // Go to sleep
      }, 180000); // 3 minutes of inactivity
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(event => window.addEventListener(event, handleActivity));
    handleActivity(); // Initial setup

    return () => {
      clearTimeout(idleTimerRef.current);
      events.forEach(event => window.removeEventListener(event, handleActivity));
    };
  }, [isSleeping]);

  // Effect for Image Rotation
  useEffect(() => {
    if (isSleeping) {
      setCurrentImage(sleepImage);
      return; // Stop rotation and just show sleep image
    }

    const updateImage = () => {
      const hour = new Date().getHours();
      if (hour >= 22 || hour < 6) {
        setCurrentImage(sleepImage);
      } else {
        const randomIndex = Math.floor(Math.random() * studyImages.length);
        setCurrentImage(studyImages[randomIndex]);
      }
    };

    updateImage(); // Set initial image when waking up
    const interval = setInterval(updateImage, 10000); // Rotate every 10 seconds

    return () => clearInterval(interval); // Cleanup interval when isSleeping becomes true
  }, [isSleeping]);

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

  if (minimized) {
    return (
      <Draggable nodeRef={nodeRef}>
        <div ref={nodeRef} className="floating-bot" onClick={() => setMinimized(false)}>
          <div className="bot-icon-container minimized-icon">
            <img src={defaultImage} alt="Floating Bot" className="bot-icon" />
          </div>
        </div>
      </Draggable>
    );
  }

  return (
    <Draggable nodeRef={nodeRef}>
      <div ref={nodeRef} className="floating-bot">
        <Popover content={content} title="AI 助教" trigger="click">
          <div className="bot-icon-container">
            <img src={currentImage} alt="Floating Bot" className="bot-icon" />
          </div>
        </Popover>
        <Button
          type="text"
          icon={<MinusOutlined />}
          onClick={() => setMinimized(true)}
          className="control-button"
        />
      </div>
    </Draggable>
  );
};

export default FloatingBot;
