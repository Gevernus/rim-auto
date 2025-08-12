import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isDev = command === 'serve' || mode === 'development'
  const isTwa = mode === 'twa' || env.VITE_TWA === '1'

  // Публичный хост, через который Telegram WebApp будет обращаться к dev-серверу (ngrok/cloudflared)
  const publicHost = env.VITE_PUBLIC_HOST || process.env.VITE_PUBLIC_HOST || ''

  // Локальные хост/порт для dev
  const devHost = env.VITE_DEV_HOST || process.env.VITE_DEV_HOST || 'localhost'
  const devPort = Number(env.VITE_DEV_PORT || process.env.VITE_DEV_PORT || 3000)

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

    // Явно пробрасываем VITE_API_URL и VITE_TELEGRAM_BOT_USERNAME на случай отсутствия .env файлов
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL ?? process.env.VITE_API_URL ?? ''),
      'import.meta.env.VITE_TELEGRAM_BOT_USERNAME': JSON.stringify(env.VITE_TELEGRAM_BOT_USERNAME ?? process.env.VITE_TELEGRAM_BOT_USERNAME ?? ''),
    },

    server: {
      host: '0.0.0.0',
      port: devPort,
      strictPort: true,
      watch: {
        usePolling: true,
        interval: 2000,
      },
      // Если запущено в режиме twa и указан публичный хост, настраиваем корректные origin/HMR для Telegram
      origin: isTwa && publicHost ? `https://${publicHost}` : undefined,
      // Конфиг HMR: локально обычный ws; для Telegram через туннель — wss на публичный хост:443
      hmr: isDev
        ? (
            isTwa && publicHost
              ? {
                  protocol: 'wss',
                  host: publicHost,
                  clientPort: 443,
                  overlay: true,
                }
              : {
                  protocol: 'ws',
                  host: devHost,
                  clientPort: devPort,
                  overlay: true,
                }
          )
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