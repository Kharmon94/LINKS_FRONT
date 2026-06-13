import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { RESERVED_SHORT_LINK_SLUGS } from './src/app/config/reserved-slugs'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_API_URL || 'http://localhost:3000'
  const reservedSlugsJson = JSON.stringify([...RESERVED_SHORT_LINK_SLUGS])

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'inject-short-link-api-url',
        transformIndexHtml(html) {
          const apiUrl = (env.VITE_API_URL || '').replace(/\/$/, '')
          return html
            .replace('%VITE_API_URL%', apiUrl)
            .replace('%RESERVED_SHORT_LINK_SLUGS%', reservedSlugsJson)
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
