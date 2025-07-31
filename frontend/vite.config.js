import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  publicDir: 'public',
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    host: '0.0.0.0', // Важно для Docker - привязываем ко всем интерфейсам
    port: 3000,
    watch: {
      usePolling: true, // Нужно для работы hot reload в Docker
      interval: 3000, // Увеличиваем интервал опроса файлов для экономии ресурсов
    },
    hmr: false, // Отключаем HMR чтобы избежать WebSocket ошибок
  },
  // Настройки для продакшена  
  build: {
    outDir: 'dist',
    sourcemap: false, // Отключаем sourcemap для экономии памяти
  },
  // Оптимизация для Docker с ограниченной памятью
  optimizeDeps: {
    exclude: ['@vitejs/plugin-react'],
    include: ['react', 'react-dom'] // Явно включаем основные зависимости
  },
  // Отключаем некоторые оптимизации для экономии памяти
  esbuild: {
    target: 'es2020'
  },
  // Отключаем некоторые функции для экономии памяти
  clearScreen: false,
  logLevel: 'warn'
}) 