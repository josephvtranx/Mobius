// vite.config.ts
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  // Load all env vars (VITE_*) from .env files
  const env = loadEnv(mode, process.cwd(), '') // no prefix filter

  // Flags from env:
  // VITE_USE_PROXY=true in dev to use Vite proxy; false/omit in prod
  const useProxy = env.VITE_USE_PROXY === 'true'

  // Where your API server runs in dev (NO trailing /api)
  const devServerOrigin = env.VITE_SERVER_ORIGIN || 'http://localhost:5001'

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      host: true,
      ...(useProxy && {
        proxy: {
          // Proxy anything starting with /api to your dev server
          '/api': {
            target: devServerOrigin,
            changeOrigin: true,
            secure: false,
            ws: true,
            // optional: debug hooks
            configure: (proxy) => {
              proxy.on('error', (err) => console.log('proxy error', err))
              proxy.on('proxyReq', (_proxyReq, req) =>
                console.log('→', req.method, req.url)
              )
              proxy.on('proxyRes', (proxyRes, req) =>
                console.log('←', proxyRes.statusCode, req.method, req.url)
              )
            },
          },
        },
      }),
    },
    build: {
      assetsDir: 'assets',
      rollupOptions: {
        input: { main: 'index.html' },
      },
    },
    publicDir: 'public',

    // ❌ Do NOT hardcode import.meta.env.VITE_API_URL here.
    // Let env files control it at runtime/build time.
    define: {
      global: 'globalThis',
    },
  }
})
