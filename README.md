# AI 教学助手（AI-Teaching-Assistant）

## 项目简介

AI 教学助手是一个基于现代前端技术构建的教学辅助系统，借助 Gemini 2.5 Pro、CodeBuddy 和 ChatGPT-5 等 AI 技术，为教师和学生提供智能化的教学支持。

静态预览地址： https://t2ek1ng0.github.io/ai-teaching-assistant/

## 功能特点

- 集成 Gemini 2.5 Pro、CodeBuddy、ChatGPT-5 等 AI 模型，提供多样化智能支持。
- 界面通过网页展示，适用于教学展示和交互。
- 架构轻量，前端体验友好，易部署和维护。

## 项目结构概览

```
.
├── .github/
│   └── workflows/  # CI/CD 自动化配置
├── public/       # 静态资源
├── src/          # 源代码及 UI 逻辑
├── .env          # 环境变量
├── .gitignore
├── README.md
├── index.html
├── vite.config.js  # Vite 构建配置
├── package.json
├── package-lock.json
└── eslint.config.js  # 代码格式检测配置
```

主语言：JavaScript、CSS、HTML 
贡献者：Gao Zijian、Zhou Jiatai

## 本地开发指南

1. 克隆仓库：
   ```bash
   git clone https://github.com/T2ek1ng0/ai-teaching-assistant.git
   cd ai-teaching-assistant
   ```

2. 安装依赖

   `npm install`

3. 启动本地开发服务器（默认端口3000）

   `npm run dev`

4. 构建项目以供生产部署

   `npm run build`

## 部署方式

项目已通过 GitHub Pages 部署（托管于 `gh-pages` 分支），访问已上线地址即可[GitHub](https://github.com/T2ek1ng0/ai-teaching-assistant)。

## 技术栈说明

- **构建工具**：Vite（现代前端打包）
- **样式**：CSS
- **代码规范**：ESLint（eslint.config.js）
- **环境配置**：.env 文件（敏感配置）
