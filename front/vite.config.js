import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// const { resolve } = require('path')
import { resolve } from "path";

export default defineConfig({
  // 起个别名，在引用资源时，可以用‘@/资源路径’直接访问
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  plugins: [vue()],
  // 配置前端服务地址和端口
  server: {
    host: '0.0.0.0',
    port: 70,
    // 是否开启 https
    https: false,
    // 设置反向代理，跨域
    proxy: {
      '/api1': {
        // 后台地址
        target: 'http://10.133.128.138:11236',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api1/, '')
      }
    }
  },

})