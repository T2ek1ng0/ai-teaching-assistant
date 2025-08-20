import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 这里是关键！将 base 配置为你的仓库名
  base: '/ai-teaching-assistant/',
})