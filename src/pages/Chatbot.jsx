import React, { useState, useRef, useEffect } from 'react';
import { Input, Button, Typography, Avatar, Spin, Card, Tooltip, message } from 'antd';
import { UserOutlined, SendOutlined, SaveOutlined } from '@ant-design/icons';
import defaultImage from '../assets/default.jpg';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { callLLM } from '../utils/llm';
import { supabase } from '../utils/supabase';
import './Chatbot.css';

const { Paragraph, Title } = Typography;
const CHAT_STORAGE_KEY = 'ai-assistant-chat-history';

const Chatbot = () => {
  const [messages, setMessages] = useState(() => {
    try {
      const savedMessages = localStorage.getItem(CHAT_STORAGE_KEY);
      return savedMessages ? JSON.parse(savedMessages) : [{ sender: 'bot', text: '您好！我是知书达鲤，您的学习小助手，有什么可以帮助您的吗？' }];
    } catch (error) {
      console.error("Failed to parse chat history from localStorage", error);
      return [{ sender: 'bot', text: '您好！我是知书达鲤，您的学习小助手，有什么可以帮助您的吗？' }];
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

  const handleSaveMemory = async (question, answer) => {
    const loadingMsg = message.loading('正在保存记忆...', 0);
    
    try {
      // 检查是否已存在相同的问题
      const { data: existing, error: checkError } = await supabase
        .from('memories')
        .select('id')
        .eq('question', question)
        .limit(1);

      if (checkError) throw checkError;

      if (existing && existing.length > 0) {
        message.info('这条问答已经记住啦，无需重复保存。');
        return;
      }

      // 插入新的记忆
      const { error: insertError } = await supabase
        .from('memories')
        .insert([{ question, answer }]);

      if (insertError) throw insertError;

      message.success('已成功记住该问答！');
    } catch (error) {
      console.error('Error saving memory:', error);
      message.error(`保存失败: ${error.message}`);
    } finally {
      loadingMsg(); // 关闭加载提示
    }
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() && !loading) {
      const userMessage = { sender: 'user', text: inputValue };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      const currentInput = inputValue;
      setInputValue('');
      setLoading(true);

      const { data: memories, error: memoriesError } = await supabase
        .from('memories')
        .select('question, answer')
        .ilike('question', `%${currentInput}%`);

      if (memoriesError) {
        console.error("Error fetching memories:", memoriesError);
      }

      let systemContent = '你是一个乐于助人、知识渊博的AI助教，请用友好、清晰、简洁的语言回答学生关于课程内容的问题。';
      if (memories && memories.length > 0) {
        const memoryContext = memories
          .map(m => `已知信息：\n- 问题: ${m.question}\n- 答案: ${m.answer}`)
          .join('\n\n');
        systemContent += `\n\n请参考以下已经存储的知识来回答问题。如果问题与已知信息高度相关，请优先使用这些知识进行回答：\n${memoryContext}`;
      }
      
      const systemPrompt = { role: 'system', content: systemContent };
      
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
    <div className="chatbot-container">
      <div className="header-section">
        <Avatar size={80} src={defaultImage} />
        <div className="header-text">
          <Title level={3} style={{ margin: 0 }}>知书达鲤 - 智能问答机器人</Title>
          <Paragraph style={{ margin: 0, marginTop: 8 }}>
            在这里，您可以就课程内容进行提问，“鲤工仔”将结合知识库为您实时解答。您可以点击机器人回答旁的“保存”按钮，让它记住重要的问答。
          </Paragraph>
        </div>
      </div>

      <Card bordered={false} className="chat-card">
        <div className="message-list">
          {messages.map((item, index) => {
            const isBotMessage = item.sender === 'bot';
            const prevMessage = index > 0 ? messages[index - 1] : null;
            const canSave = isBotMessage && prevMessage && prevMessage.sender === 'user';

            return (
              <div key={index} className={`message-item ${item.sender}`}>
                {isBotMessage && <Avatar className="message-avatar" src={defaultImage} />}
                <div className="message-content">
                  <div className="message-bubble">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.text}</ReactMarkdown>
                  </div>
                  {canSave && (
                    <Tooltip title="记住这次问答">
                      <Button 
                        className="save-memory-btn"
                        type="text" 
                        icon={<SaveOutlined />} 
                        onClick={() => handleSaveMemory(prevMessage.text, item.text)}
                      />
                    </Tooltip>
                  )}
                </div>
                {!isBotMessage && <Avatar className="message-avatar" icon={<UserOutlined />} />}
              </div>
            );
          })}
          {loading && (
            <div className="message-item bot">
              <Avatar className="message-avatar" src={defaultImage} />
              <div className="message-bubble">
                <Spin size="small" /> 正在思考中...
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        <div className="chat-input-area">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onPressEnter={handleSendMessage}
            placeholder="请输入您的问题，然后按 Enter 或点击发送按钮"
            disabled={loading}
            size="large"
          />
          <Button 
            type="primary" 
            icon={<SendOutlined />} 
            onClick={handleSendMessage} 
            style={{ marginLeft: '12px' }} 
            loading={loading}
            size="large"
          >
            发送
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Chatbot;