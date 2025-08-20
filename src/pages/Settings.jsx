import React, { useEffect } from 'react';
import { Form, Input, Button, Typography, message, Alert } from 'antd';
import { SaveOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;
const API_BASE_URL_KEY = 'llm-api-base-url';
const API_KEY_KEY = 'llm-api-key';

const Settings = () => {
  const [form] = Form.useForm();

  useEffect(() => {
    const savedApiBaseUrl = localStorage.getItem(API_BASE_URL_KEY) || '';
    const savedApiKey = localStorage.getItem(API_KEY_KEY) || '';
    form.setFieldsValue({
      apiBaseUrl: savedApiBaseUrl,
      apiKey: savedApiKey,
    });
  }, [form]);

  const onFinish = (values) => {
    try {
      localStorage.setItem(API_BASE_URL_KEY, values.apiBaseUrl.trim());
      localStorage.setItem(API_KEY_KEY, values.apiKey.trim());
      message.success('API 设置已成功保存！');
    } catch (error) {
      message.error('保存设置失败，请检查浏览器是否支持 localStorage。');
      console.error("Failed to save settings:", error);
    }
  };

  return (
    <div>
      <Title level={4}>大模型 API 设置</Title>
      <Paragraph>
        在这里配置您的 AI 模型服务。这些信息将仅保存在您的浏览器本地，不会上传到任何服务器，请放心使用。
      </Paragraph>
      <Alert
        message="兼容 OpenAI API 格式"
        description="请输入您的模型服务商提供的 API 地址 (API Base URL) 和 API 密钥 (API Key)。"
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />
      <Form
        form={form}
        onFinish={onFinish}
        layout="vertical"
        style={{ maxWidth: 600 }}
      >
        <Form.Item
          name="apiBaseUrl"
          label="API Base URL"
          rules={[{ required: true, message: '请输入 API Base URL!' }]}
        >
          <Input placeholder="例如：https://api.openai.com/v1" />
        </Form.Item>
        <Form.Item
          name="apiKey"
          label="API Key"
          rules={[{ required: true, message: '请输入 API Key!' }]}
        >
          <Input.Password placeholder="请输入您的 API 密钥" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
            保存设置
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Settings;