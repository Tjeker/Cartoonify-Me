import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'

export default defineConfig({
  plugins: [vue(), vuetify({ autoImport: true })],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) }
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    // Forward frontend /api requests to the local Python backend.
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  // Keep overlay components in one module graph in development.
  optimizeDeps: {
    include: ['vuetify/components/VOverlay', 'vuetify/components/VDialog']
  }
})
