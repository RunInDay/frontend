import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import babel from 'vite-plugin-babel'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({
      babelConfig: {
        plugins: ['@emotion/babel-plugin'],
      },
    }),
  ],
  resolve: {
    alias: {
      '@styles': path.resolve(__dirname, './src/styles'),
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api/tour': {
        target: 'http://apis.data.go.kr',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/tour/, '/B551011/KorService2'),
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Tour Proxying:', req.method, req.url, '→', proxyReq.path)
          })
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Tour Proxy response:', proxyRes.statusCode, req.url)
          })
        }
      },
      '/api/durunubi': {
        target: 'http://apis.data.go.kr',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/durunubi/, '/B551011/Durunubi'),
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Durunubi Proxying:', req.method, req.url, '→', proxyReq.path)
          })
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Durunubi Proxy response:', proxyRes.statusCode, req.url)
          })
        }
      }
    }
  }
})
