import React, { useState, useEffect } from 'react';
import { Input, Button, Form, message, Typography, Card, Modal, Table, Space, Popconfirm } from 'antd';
import { supabase } from '../utils/supabase';

const { Title, Paragraph } = Typography;

const MemoryManager = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  const correctPassword = import.meta.env.VITE_ADMIN_PASSWORD;

  useEffect(() => {
    if (isAuthenticated) {
      fetchMemories();
    }
  }, [isAuthenticated]);

  const fetchMemories = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('memories').select('*').order('created_at', { ascending: false });
    if (error) {
      message.error('加载记忆失败: ' + error.message);
    } else {
      setMemories(data);
    }
    setLoading(false);
  };

  const handlePasswordSubmit = (values) => {
    if (values.password === correctPassword) {
      setIsAuthenticated(true);
      message.success('密码正确，欢迎进入记忆管理后台！');
    } else {
      message.error('密码错误，请重试！');
    }
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from('memories').delete().match({ id });
    if (error) {
      message.error('删除失败: ' + error.message);
    } else {
      message.success('删除成功');
      fetchMemories();
    }
  };

  const showModal = (record = null) => {
    setEditingRecord(record);
    form.setFieldsValue(record || { question: '', answer: '' });
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      let error;
      if (editingRecord) {
        // 更新
        ({ error } = await supabase.from('memories').update(values).match({ id: editingRecord.id }));
      } else {
        // 创建
        ({ error } = await supabase.from('memories').insert([values]));
      }

      if (error) {
        message.error('操作失败: ' + error.message);
      } else {
        message.success('操作成功');
        setIsModalVisible(false);
        fetchMemories();
      }
    } catch (info) {
      console.log('Validate Failed:', info);
    }
  };

  if (!isAuthenticated) {
    return (
      <Card>
        <Title level={4}>记忆管理后台</Title>
        <Paragraph>请输入密码以访问此页面。</Paragraph>
        <Form onFinish={handlePasswordSubmit} layout="inline">
          <Form.Item name="password" rules={[{ required: true, message: '请输入密码!' }]}>
            <Input.Password placeholder="请输入密码" style={{ width: 200 }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">进入</Button>
          </Form.Item>
        </Form>
      </Card>
    );
  }

  const columns = [
    { title: '问题 (Question)', dataIndex: 'question', key: 'question' },
    { title: '答案 (Answer)', dataIndex: 'answer', key: 'answer' },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <a onClick={() => showModal(record)}>编辑</a>
          <Popconfirm title="确定删除吗?" onConfirm={() => handleDelete(record.id)}>
            <a>删除</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={4}>记忆管理后台</Title>
      <Button type="primary" onClick={() => showModal()} style={{ marginBottom: 16 }}>
        新增记忆
      </Button>
      <Table columns={columns} dataSource={memories} rowKey="id" loading={loading} />
      <Modal
        title={editingRecord ? '编辑记忆' : '新增记忆'}
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="question" label="问题" rules={[{ required: true }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="answer" label="答案" rules={[{ required: true }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MemoryManager;