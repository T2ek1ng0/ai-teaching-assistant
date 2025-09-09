import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Layout, Input, Button, Avatar, Spin, Select, Menu, Popconfirm, message } from 'antd';
import { UserOutlined, SendOutlined, PlusOutlined, DeleteOutlined, MessageOutlined } from '@ant-design/icons';
import defaultImage from '../assets/default.jpg';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { callLLM } from '../utils/llm';
import { supabase } from '../utils/supabase';
import './Chatbot.css';

const { Sider, Content } = Layout;
const { TextArea } = Input;

const teachingStyles = [
  { value: 'default', label: '默认风格' },
  { value: 'patient', label: '耐心引导' },
  { value: 'humorous', label: '风趣幽默' },
  { value: 'strict', label: '严格严谨' },
];

const styleSystemPrompts = {
  default: '你是一个乐于助人、知识渊博的AI助教，请用友好、清晰、简洁的语言回答学生关于课程内容的问题。',
  patient: '你是一位非常有耐心的老师，请用循循善诱、充满鼓励的语气来回答学生的问题，多使用引导性的提问，帮助学生自己思考。',
  humorous: '你是一位风趣幽merous的大学教授，请用轻松、幽默、带点俏皮话的方式来回答学生的问题，可以适当引用一些有趣的比喻或网络热梗。',
  strict: '你是一位治学严谨的学者，请用非常精确、严谨、书面化的语言来回答学生的问题，注重逻辑和事实的准确性。',
};

const Chatbot = () => {
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [style, setStyle] = useState('default');
  const chatEndRef = useRef(null);
  const initialized = useRef(false);

  const fetchSessions = useCallback(async () => {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      message.error('加载会话列表失败: ' + error.message);
    } else {
      setSessions(data);
    }
  }, []);

  useEffect(() => {
    // Ensure this runs only once, even in strict mode
    if (initialized.current) return;
    initialized.current = true;

    const initializeChat = async () => {
      setLoading(true);
      // Clean up any previous sessions titled "New Chat" that have no user messages.
      const { data: oldNewChats, error: findError } = await supabase
        .from('chat_sessions')
        .select('id')
        .eq('title', '新的聊天');

      if (findError) {
        message.error('查找旧会话失败: ' + findError.message);
      } else if (oldNewChats) {
        for (const chat of oldNewChats) {
          const { count, error: countError } = await supabase
            .from('chat_messages')
            .select('id', { count: 'exact', head: true })
            .eq('session_id', chat.id)
            .eq('role', 'user');
          
          if (!countError && count === 0) {
            // This is an unused chat, delete it and its messages
            await supabase.from('chat_messages').delete().match({ session_id: chat.id });
            await supabase.from('chat_sessions').delete().match({ id: chat.id });
          }
        }
      }

      // Fetch existing sessions first to populate the sidebar
      const { data: existingSessions, error: fetchError } = await supabase
        .from('chat_sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        message.error('加载会话列表失败: ' + fetchError.message);
      }
      
      // Now create the new session for the user
      const { data: newSession, error: newSessionError } = await supabase
        .from('chat_sessions')
        .insert([{ title: '新的聊天' }])
        .select()
        .single();

      if (newSessionError) {
        message.error('创建新会话失败: ' + newSessionError.message);
        setLoading(false); // Stop loading on error
        return;
      }

      // Add the initial greeting message from the assistant to the DB
      const greetingContent = '你好！我是你的AI助教，有什么可以帮助你的吗？';
      const { error: botError } = await supabase
        .from('chat_messages')
        .insert([{ session_id: newSession.id, role: 'assistant', content: greetingContent }]);
      
      if (botError) {
          message.error('发送初始消息失败: ' + botError.message);
      }
      
      // Prepend the new session and set it as active.
      // This will trigger the `useEffect` for `fetchMessages` to load the messages.
      setSessions([newSession, ...(existingSessions || [])]);
      setActiveSessionId(newSession.id);
    };

    initializeChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array to run only on mount

  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeSessionId) {
        setMessages([]);
        return;
      }
      setLoading(true);
      setMessages([]); // Clear previous messages to prevent "jump" and show loading state
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', activeSessionId)
        .order('created_at', { ascending: true });
      
      if (error) {
        message.error('加载消息失败: ' + error.message);
      } else {
        setMessages(data);
      }
      setLoading(false);
    };
    fetchMessages();
  }, [activeSessionId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleNewSession = async () => {
    setLoading(true);
    let currentSessions = [...sessions];

    // Find a previous "New Chat" session that was unused.
    const previousNewChat = sessions.find(s => s.title === '新的聊天');
    if (previousNewChat) {
        const { count, error } = await supabase
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .eq('session_id', previousNewChat.id)
            .eq('role', 'user');

        if (error) {
            message.error('检查旧会话失败: ' + error.message);
        } else if (count === 0) {
            // It's unused, so delete it from DB and local state
            await supabase.from('chat_messages').delete().match({ session_id: previousNewChat.id });
            await supabase.from('chat_sessions').delete().match({ id: previousNewChat.id });
            currentSessions = currentSessions.filter(s => s.id !== previousNewChat.id);
        }
    }

    // Now create the actual new session
    const { data: newSession, error: newSessionError } = await supabase
        .from('chat_sessions')
        .insert([{ title: '新的聊天' }])
        .select()
        .single();

    if (newSessionError) {
        message.error('创建新会话失败: ' + newSessionError.message);
        setSessions(currentSessions); // Update state with deleted session if any
    } else if (newSession) {
        // Add a greeting message to the new session
        const greetingContent = '你好！我是你的AI助教，有什么可以帮助你的吗？';
        const { data: botMsgData, error: botError } = await supabase
            .from('chat_messages')
            .insert([{ session_id: newSession.id, role: 'assistant', content: greetingContent }])
            .select()
            .single();
        
        if (botError) {
            message.error('发送初始消息失败: ' + botError.message);
            // Rollback
            await supabase.from('chat_sessions').delete().match({ id: newSession.id });
            setSessions(currentSessions);
        } else {
            // Update state with the new session at the top
            setSessions([newSession, ...currentSessions]);
            setActiveSessionId(newSession.id);
            setMessages(botMsgData ? [botMsgData] : []);
        }
    }
    setLoading(false);
  };

  const handleDeleteSession = async (sessionId) => {
    const { error } = await supabase.from('chat_sessions').delete().match({ id: sessionId });
    if (error) {
      message.error('删除会话失败: ' + error.message);
    } else {
      message.success('会话已删除');
      if (activeSessionId === sessionId) {
        setActiveSessionId(null);
      }
      await fetchSessions();
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || loading || !activeSessionId) return;

    const currentInput = inputValue;
    setInputValue('');
    setLoading(true);

    // Save user message to DB and get it back
    const { data: userMsgData, error: userError } = await supabase
      .from('chat_messages')
      .insert([{ session_id: activeSessionId, role: 'user', content: currentInput }])
      .select()
      .single();

    if (userError) {
      message.error('发送消息失败: ' + userError.message);
      setLoading(false);
      return;
    }

    // Update state with the new user message
    const updatedMessages = [...messages, userMsgData];
    setMessages(updatedMessages);

    // If this is the first user message in a session, update session title
    // The initial message from the assistant doesn't count.
    const userMessages = updatedMessages.filter(m => m.role === 'user');
    if (userMessages.length === 1) {
      const newTitle = currentInput.substring(0, 20);
      const { error: updateError } = await supabase
        .from('chat_sessions')
        .update({ title: newTitle })
        .match({ id: activeSessionId });
      
      if (updateError) {
        message.error('更新会话标题失败: ' + updateError.message);
      } else {
        setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, title: newTitle } : s));
      }
    }

    // Prepare for and call LLM
    const systemPrompt = { role: 'system', content: styleSystemPrompts[style] };
    const apiMessages = updatedMessages.map(msg => ({ role: msg.role, content: msg.content }));
    const llmResponse = await callLLM([systemPrompt, ...apiMessages]);

    let botReplyContent = '';
    if (llmResponse.success) {
      botReplyContent = llmResponse.data;
    } else {
      botReplyContent = `抱歉，出错了：${llmResponse.error}`;
    }

    // Save bot message to DB and get it back
    const { data: botMsgData, error: botError } = await supabase
      .from('chat_messages')
      .insert([{ session_id: activeSessionId, role: 'assistant', content: botReplyContent }])
      .select()
      .single();
      
    if (botError) {
        message.error('接收回复失败: ' + botError.message);
    } else if (botMsgData) {
      setMessages(prev => [...prev, botMsgData]);
    }
    
    setLoading(false);
  };

  return (
    <Layout className="chatbot-layout">
      <Sider width={250} className="chatbot-sider">
        <div className="sider-header">
          <Button type="primary" icon={<PlusOutlined />} block onClick={handleNewSession}>
            新聊天
          </Button>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={activeSessionId ? [String(activeSessionId)] : []}
          className="session-menu"
        >
          {sessions.map(session => (
            <Menu.Item key={session.id} icon={<MessageOutlined />} onClick={() => setActiveSessionId(session.id)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {session.title}
                </span>
                <Popconfirm
                  title="确定删除这个会话吗?"
                  onConfirm={(e) => { e.stopPropagation(); handleDeleteSession(session.id); }}
                  onCancel={(e) => e.stopPropagation()}
                  okText="删除"
                  cancelText="取消"
                >
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    className="delete-session-btn"
                    onClick={(e) => e.stopPropagation()}
                  />
                </Popconfirm>
              </div>
            </Menu.Item>
          ))}
        </Menu>
      </Sider>
      <Layout className="chat-content-layout">
        <Content className="chat-content">
          {loading && messages.length === 0 ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Spin size="large" />
            </div>
          ) : (
            <div className="message-list">
              {messages.map((item, index) => (
                <div key={index} className={`message-item ${item.role}`}>
                  <Avatar className="message-avatar" src={item.role === 'assistant' ? defaultImage : null} icon={item.role === 'user' ? <UserOutlined /> : null} />
                  <div className="message-bubble">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.content}</ReactMarkdown>
                  </div>
                </div>
              ))}
              {loading && messages.length > 0 && (
                <div className="message-item assistant">
                  <Avatar className="message-avatar" src={defaultImage} />
                  <div className="message-bubble">
                    <Spin size="small" /> 正在思考中...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          )}
        </Content>
        <div className="chat-input-area">
          <div className="input-toolbar">
            <span>教学风格:</span>
            <Select
              value={style}
              onChange={setStyle}
              options={teachingStyles}
              style={{ width: 120 }}
            />
          </div>
          <TextArea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onPressEnter={(e) => {
              if (!e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="请输入您的问题 (Shift + Enter 换行)"
            disabled={loading}
            autoSize={{ minRows: 1, maxRows: 5 }}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSendMessage}
            loading={loading}
          >
            发送
          </Button>
        </div>
      </Layout>
    </Layout>
  );
};

export default Chatbot;