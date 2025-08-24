import React from 'react';
import { Typography, Divider } from 'antd';
import './Guide.css';

const { Title, Paragraph, Text } = Typography;

const Guide = () => {
  return (
    <div className="guide-container">
      <Title level={2}>AI 助教系统使用指南</Title>

      <Divider />

      <Title level={3}>教师专栏</Title>
      <Paragraph>
        教师专栏主要包含 <Text strong>课程设计</Text> 和 <Text strong>批改学生作业</Text> 两大模块。
      </Paragraph>
      <Paragraph>
        <ul>
          <li>
            <Text strong>课程设计：</Text>
            辅助教师快速生成教学大纲、课件和习题。
          </li>
          <li>
            <Text strong>批改学生作业：</Text>
            利用 AI 对学生提交的作业进行初步批改和评价。
          </li>
        </ul>
      </Paragraph>

      <Divider />

      <Title level={3}>学生必备</Title>
      <Paragraph>
        学生必备模块提供了 <Text strong>课程预习</Text>、<Text strong>自学助手</Text> 和 <Text strong>智能答疑机器人</Text>。
      </Paragraph>
      <Paragraph>
        <ul>
          <li>
            <Text strong>课程预习：</Text>
            根据课程内容，为学生生成预习资料。
          </li>
          <li>
            <Text strong>自学助手：</Text>
            提供个性化的学习路径和资源推荐。
          </li>
          <li>
            <Text strong>智能答疑机器人：</Text>
            随时回答学生在学习过程中遇到的问题。
          </li>
        </ul>
      </Paragraph>

      <Divider />

      <Title level={3}>设置</Title>
      <Paragraph>
        在设置页面，您可以进行 <Text strong>API 配置</Text> 和 <Text strong>记忆管理</Text>。
      </Paragraph>
      <Paragraph>
        <ul>
          <li>
            <Text strong>API 配置：</Text>
            配置与外部大模型服务连接所需的 API Key。
          </li>
          <li>
            <Text strong>记忆管理：</Text>
            管理系统的记忆库，优化 AI 的回答质量。
          </li>
        </ul>
      </Paragraph>
    </div>
  );
};

export default Guide;