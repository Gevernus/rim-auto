import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isDev = command === 'serve' || mode === 'development'

  return {
    plugins: [react()],
    publicDir: 'public',
    resolve: {
      alias: {
        '@': '/src',
      },
    },

    // Делает доступными только переменные с префиксом VITE_
    envPrefix: ['VITE_'],

    // Явно пробрасываем VITE_API_URL на случай отсутствия .env файлов
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL ?? process.env.VITE_API_URL ?? ''),
    },

    server: {
      host: '0.0.0.0',
      port: 3000,
      strictPort: true,
      watch: {
        usePolling: true,
        interval: 2000,
      },
      // Конфиг HMR для Docker. Если ранее были ошибки WS — это решает clientPort/host
      hmr: isDev
        ? {
            protocol: 'ws',
            host: 'localhost',
            clientPort: 3000,
            overlay: true,
          }
        : false,
    },

    // Для локального предпросмотра production билда
    preview: {
      host: '0.0.0.0',
      port: 3000,
      strictPort: true,
    },

    build: {
      outDir: 'dist',
      sourcemap: false,
      target: 'es2020',
    },

    optimizeDeps: {
      include: ['react', 'react-dom'],
    },

    esbuild: {
      target: 'es2020',
    },

    clearScreen: false,
    logLevel: isDev ? 'info' : 'warn',
  }
}) 