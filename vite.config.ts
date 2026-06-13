import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { handleShortLinkProxy } from './short-link-proxy.mjs'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_API_URL || env.API_URL || 'http://localhost:3000'

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'short-link-proxy-dev',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.method === 'GET' || req.method === 'HEAD') {
              const handled = await handleShortLinkProxy(req, res, { apiUrl: apiTarget })
              if (handled) return
            }
            next()
          })
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    assetsInclude: ['**/*.svg', '**/*.csv', '**/*.png'],
    build: {
      outDir: 'build',
      sourcemap: false,
    },
    server: {
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
        },
        '/users': {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
  }
})
