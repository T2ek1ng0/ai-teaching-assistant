import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Space, Spin, message, Alert, Dropdown } from 'antd';
import { DownloadOutlined, FileWordOutlined, FileMarkdownOutlined, CopyOutlined } from '@ant-design/icons';
import { saveAs } from 'file-saver';
import { marked } from 'marked';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { callLLM } from '../utils/llm';

const { Title, Paragraph } = Typography;

const CourseDesignAssistant = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const onFinish = async (values) => {
    console.log('Received values of form: ', values);
    setLoading(true);
    setResult(null);
    setError(null);

    const systemPrompt = `你是一位顶级的教学设计师，专门为大学教师设计课程。请根据用户提供的课程主题和关键词，生成一份详细的教学材料。
你的回答必须遵循以下JSON格式，不要添加任何额外的解释或说明文字：
{
  "syllabus": "一个详细的、分章节的教学大纲，使用Markdown格式。",
  "keyPoints": "课程的重点和难点分析，使用Markdown格式。",
  "exercises": "3-5个相关的课后习题建议，使用Markdown格式。",
  "keyFormulas": "提取课程中的核心公式，以LaTeX数组格式提供，例如：[\\"E=mc^2\\", \\"F=ma\\"]。",
  "fullCourseDesign": "一份完整的课程设计文档，包含课程简介、教学目标、教学安排、考核方式和教学资源，使用Markdown格式。"
}`;

    const userPrompt = `课程主题: ${values.topic}\n关键词: ${values.keywords}`;

    const llmResponse = await callLLM([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    if (llmResponse.success) {
      try {
        const parsedResult = JSON.parse(llmResponse.data);
        setResult(parsedResult);
      } catch (e) {
        console.error("Failed to parse LLM response:", e);
        setError("AI返回的数据格式不正确，无法解析。请稍后重试。");
        message.error("AI返回的数据格式不正确，无法解析。");
      }
    } else {
      setError(llmResponse.error);
      message.error(llmResponse.error);
    }

    setLoading(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      message.success('已成功复制到剪贴板');
    }, (err) => {
      message.error('复制失败');
      console.error('Could not copy text: ', err);
    });
  };

  // 导出为Markdown文件
  const exportToMarkdown = () => {
    if (!result) {
      message.warning('请先生成教学材料');
      return;
    }

    const fileName = `课程设计_${new Date().toLocaleDateString().replace(/\//g, '-')}.md`;
    let content = '';
    if (result.fullCourseDesign) {
      content += `# 完整课程设计\n\n${result.fullCourseDesign}\n\n`;
    }
    content += `# 教学大纲\n\n${result.syllabus}\n\n# 重点难点分析\n\n${result.keyPoints}\n\n# 课后习题建议\n\n${result.exercises}`;
    
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    saveAs(blob, fileName);
    message.success('Markdown文件导出成功');
  };

  // 将Markdown文本转换为简单的纯文本
  const convertMarkdownToPlainText = (markdown) => {
    // 简单替换一些常见的Markdown语法
    return markdown
      .replace(/#{1,6}\s+/g, '') // 移除标题符号
      .replace(/\*\*(.*?)\*\*/g, '$1') // 移除粗体
      .replace(/\*(.*?)\*/g, '$1') // 移除斜体
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // 替换链接为纯文本
      .replace(/```[\s\S]*?```/g, '') // 移除代码块
      .replace(/`(.*?)`/g, '$1'); // 移除内联代码
  };

  // 创建段落数组，处理多行文本
  const createParagraphs = (text, isHeading = false) => {
    const lines = text.split('\n');
    return lines.map(line => {
      if (!line.trim()) return new DocxParagraph({ text: '' }); // 空行
      
      if (isHeading) {
        return new DocxParagraph({
          text: line,
          heading: HeadingLevel.HEADING_1,
        });
      }
      
      return new DocxParagraph({
        children: [
          new TextRun({
            text: line,
          }),
        ],
      });
    });
  };

  // 直接导出为Word文档
  const exportToWord = () => {
    if (!result) {
      message.warning('请先生成教学材料');
      return;
    }

    try {
      // 使用 marked 将 Markdown 转换为 HTML
      const fullDesignHtml = marked(result.fullCourseDesign || '');
      const syllabusHtml = marked(result.syllabus || '');
      const keyPointsHtml = marked(result.keyPoints || '');
      const exercisesHtml = marked(result.exercises || '');

      // 创建一个精美的HTML模板
      let htmlTemplate = '';
      if (result.fullCourseDesign) {
        htmlTemplate += `
        <div class="section">
          <h1>完整课程设计</h1>
          <div class="content">${fullDesignHtml}</div>
        </div>
        `;
      }
      htmlTemplate += `
        <div class="section">
          <h1>教学大纲</h1>
          <div class="content">${syllabusHtml}</div>
        </div>
        <div class="section">
          <h1>重点难点分析</h1>
          <div class="content">${keyPointsHtml}</div>
        </div>
        <div class="section">
          <h1>课后习题建议</h1>
          <div class="content">${exercisesHtml}</div>
        </div>
      `;

      // 构建完整的Word文件内容，包含更专业的CSS样式
      const fullHtml = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office'
              xmlns:w='urn:schemas-microsoft-com:office:word'
              xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset='utf-8'>
          <title>课程设计</title>
          <style>
            /* --- 通用样式 --- */
            body {
              font-family: 'Dengxian', '等线', 'Microsoft YaHei', '微软雅黑', sans-serif;
              font-size: 12pt;
              line-height: 1.75;
              margin: 2.5cm 2cm; /* A4页面边距 */
            }

            /* --- 章节样式 --- */
            .section {
              margin-bottom: 28px;
              page-break-after: always; /* 每个部分后分页 */
            }
            .section:last-child {
              page-break-after: auto;
            }

            /* --- 标题样式 --- */
            h1 {
              font-size: 22pt;
              font-weight: bold;
              color: #2E74B5; /* 深蓝色 */
              border-bottom: 2px solid #2E74B5;
              padding-bottom: 8px;
              margin-bottom: 20px;
            }
            h2 {
              font-size: 16pt;
              font-weight: bold;
              color: #333;
              margin-top: 24px;
              margin-bottom: 12px;
            }
            h3 {
              font-size: 14pt;
              font-weight: bold;
              color: #444;
              margin-top: 20px;
              margin-bottom: 10px;
            }

            /* --- 内容样式 --- */
            p {
              margin: 0 0 12px 0;
              text-align: justify; /* 两端对齐 */
            }
            strong, b {
              font-weight: bold;
              color: #BF4C15; /* 橙色强调 */
            }
            ul, ol {
              margin-top: 0;
              margin-bottom: 12px;
              padding-left: 30px;
            }
            li {
              margin-bottom: 8px;
            }
            a {
              color: #0563C1;
              text-decoration: none;
            }
            a:hover {
              text-decoration: underline;
            }
            pre, code {
              font-family: 'Consolas', 'Courier New', monospace;
              background-color: #F3F3F3;
              border: 1px solid #DDD;
              border-radius: 4px;
              padding: 10px;
              font-size: 10pt;
              white-space: pre-wrap; /* 自动换行 */
              word-wrap: break-word;
            }
          </style>
        </head>
        <body>${htmlTemplate}</body>
        </html>
      `;
      
      // 创建Blob并使用file-saver下载
      const blob = new Blob(['\ufeff', fullHtml], {
        type: 'application/msword'
      });
      
      saveAs(blob, `课程设计_${new Date().toLocaleDateString().replace(/\//g, '-')}.doc`);
      message.success('Word文档已成功导出！');
    } catch (error) {
      console.error('导出Word文档时出错:', error);
      message.error('导出Word文档失败，请查看控制台获取更多信息。');
    }
  };

  // 导出菜单项
  const exportItems = [
    {
      key: 'markdown',
      label: '导出为Markdown',
      icon: <FileMarkdownOutlined />,
      onClick: exportToMarkdown,
    },
    {
      key: 'word',
      label: '导出为Word',
      icon: <FileWordOutlined />,
      onClick: exportToWord,
    },
  ];

  return (
    <div>
      <Title level={4}>课程设计助手</Title>
      <Paragraph>请输入课程主题和关键词，AI将为您生成教学大纲、重点难点分析和课后习题建议。</Paragraph>
      
      <Form onFinish={onFinish} layout="vertical">
        <Form.Item
          name="topic"
          label="课程主题"
          rules={[{ required: true, message: '请输入课程主题!' }]}
        >
          <Input placeholder="例如：机器学习入门" />
        </Form.Item>
        <Form.Item
          name="keywords"
          label="关键词"
          rules={[{ required: true, message: '请输入关键词!' }]}
        >
          <Input placeholder="例如：线性回归, 逻辑回归, 如没有可以填空格" />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              {loading ? '正在生成...' : '生成教学材料'}
            </Button>
            {result && (
              <Dropdown menu={{ items: exportItems }} placement="bottomRight">
                <Button icon={<DownloadOutlined />}>导出文档</Button>
              </Dropdown>
            )}
          </Space>
        </Form.Item>
      </Form>

      {error && <Alert message="错误" description={error} type="error" showIcon style={{ marginBottom: 24 }} />}
      
      <Spin spinning={loading} tip="AI 正在努力生成中..." size="large">
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Card title="完整课程设计" bordered={true} style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.09)' }} headStyle={{ color: '#2E74B5' }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {result?.fullCourseDesign || '这里将显示生成的完整课程设计...'}
            </ReactMarkdown>
          </Card>
          <Card title="教学大纲" bordered={true} style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.09)' }} headStyle={{ color: '#2E74B5' }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {result?.syllabus || '这里将显示生成的教学大纲...'}
            </ReactMarkdown>
          </Card>
          <Card title="重点难点分析" bordered={true} style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.09)' }} headStyle={{ color: '#2E74B5' }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {result?.keyPoints || '这里将显示生成的重点难点分析...'}
            </ReactMarkdown>
          </Card>
          <Card title="课后习题建议" bordered={true} style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.09)' }} headStyle={{ color: '#2E74B5' }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {result?.exercises || '这里将显示生成的课后习题建议...'}
            </ReactMarkdown>
          </Card>
          <Card
            title="重点公式"
            bordered={true}
            style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.09)' }}
            headStyle={{ color: '#2E74B5' }}
            extra={
              result?.keyFormulas && (
                <Button
                  icon={<CopyOutlined />}
                  onClick={() => copyToClipboard(result.keyFormulas.join('\n'))}
                >
                  复制LaTeX
                </Button>
              )
            }
          >
            {result?.keyFormulas ? (
              <ul>
                {result.keyFormulas.map((formula, index) => (
                  <li key={index}>{`$$${formula}$$`}</li>
                ))}
              </ul>
            ) : (
              '这里将显示生成的重点公式...'
            )}
          </Card>
        </Space>
      </Spin>
    </div>
  );
};

export default CourseDesignAssistant;
