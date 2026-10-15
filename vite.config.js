import { fileURLToPath, URL } from 'node:url'
import path from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => {
  // Always load .env* next to this config file (not process.cwd())
  const envDir = path.dirname(fileURLToPath(import.meta.url))
  const env = loadEnv(mode, envDir, '')
  const apiTarget = env.VITE_BASE_URL || 'http://127.0.0.1:8082'
  const parsed = Number.parseInt(String(env.VITE_DEV_PORT || '').trim(), 10)
  const port = Number.isFinite(parsed) && parsed > 0 ? parsed : 5174

  return {
    envDir,
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port,
      host: true,
      open: true,
      proxy: {
        '^/(auth|user|categories|banners|brands|goods|cart|addresses|orders|reviews|after-sales|browse-history|search-history)': {
          target: apiTarget,
          changeOrigin: true,
        },
        '/avatars': {
          target: apiTarget,
          changeOrigin: true,
        },
        '/goods-images': {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
  }
})
