import React, { useState, useRef, useEffect } from 'react';
import { Input, Button, Typography, Avatar, Spin } from 'antd';
import { UserOutlined, RobotOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { callLLM } from '../utils/llm';
import './Chatbot.css';

const { Paragraph, Title } = Typography;
const CHAT_STORAGE_KEY = 'ai-assistant-chat-history';

const Chatbot = () => {
  const [messages, setMessages] = useState(() => {
    try {
      const savedMessages = localStorage.getItem(CHAT_STORAGE_KEY);
      return savedMessages ? JSON.parse(savedMessages) : [{ sender: 'bot', text: '您好！我是您的智能助教，有什么可以帮助您的吗？' }];
    } catch (error) {
      console.error("Failed to parse chat history from localStorage", error);
      return [{ sender: 'bot', text: '您好！我是您的智能助教，有什么可以帮助您的吗？' }];
    }
  });
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);
  
  useEffect(() => {
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    } catch (error) {
      console.error("Failed to save chat history to localStorage", error);
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputValue.trim() && !loading) {
      const userMessage = { sender: 'user', text: inputValue };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setInputValue('');
      setLoading(true);

      const systemPrompt = {
        role: 'system',
        content: '你是一个乐于助人、知识渊博的AI助教，请用友好、清晰、简洁的语言回答学生关于课程内容的问题。'
      };
      
      const apiMessages = updatedMessages.map(msg => ({
        role: msg.sender === 'bot' ? 'assistant' : 'user',
        content: msg.text
      }));

      const llmResponse = await callLLM([systemPrompt, ...apiMessages]);

      if (llmResponse.success) {
        const botReply = { sender: 'bot', text: llmResponse.data };
        setMessages(prev => [...prev, botReply]);
      } else {
        const errorReply = { sender: 'bot', text: `抱歉，出错了：${llmResponse.error}` };
        setMessages(prev => [...prev, errorReply]);
      }
      
      setLoading(false);
    }
  };

  return (
    <div>
      <Title level={4}>智能答疑机器人</Title>
      <Paragraph>在这里，您可以就课程内容进行提问，AI助教将为您实时解答。</Paragraph>
      <div style={{ height: '450px', display: 'flex', flexDirection: 'column', border: '1px solid #f0f0f0', background: '#fafafa' }}>
        <div className="message-list" style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {messages.map((item, index) => (
            <div key={index} className={`message-item ${item.sender}`}>
              {item.sender === 'bot' && <Avatar className="message-avatar" style={{ backgroundColor: '#005A9C' }} icon={<RobotOutlined />} />}
              <div className="message-bubble">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.text}</ReactMarkdown>
              </div>
              {item.sender === 'user' && <Avatar className="message-avatar" icon={<UserOutlined />} />}
            </div>
          ))}
          {loading && (
            <div className="message-item bot">
              <Avatar className="message-avatar" style={{ backgroundColor: '#005A9C' }} icon={<RobotOutlined />} />
              <div className="message-bubble">
                <Spin size="small" /> 正在思考中...
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        <div style={{ display: 'flex', padding: '16px', borderTop: '1px solid #f0f0f0' }}>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onPressEnter={handleSendMessage}
            placeholder="请输入您的问题..."
            disabled={loading}
          />
          <Button type="primary" onClick={handleSendMessage} style={{ marginLeft: '8px' }} loading={loading}>
            发送
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
