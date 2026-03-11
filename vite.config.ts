import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // ده أهم جزء لحل مشكلة Vercel: إجبار المشروع كله على استخدام نسخة واحدة من React
      'react': path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
    },
  },
  optimizeDeps: {
    // نأكد على المكتبات اللي عاملة أزمة في الـ Resolution
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'recharts',
      'react-date-range',
      'date-fns',
      'framer-motion'
    ],
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true,
      },
    },
  },
  build: {
    commonjsOptions: {
      // مع React 19 لازم نضمن إن المكتبات القديمة بيتعمل لها تحويل صح
      include: [/recharts/, /react-date-range/, /node_modules/],
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-charts': ['recharts'],
          'vendor-motion': ['framer-motion'],
        },
      },
    },
  },
})