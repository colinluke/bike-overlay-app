import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/yt': {
        target: 'https://www.youtube.com',
        changeOrigin: true,
        restrictCORS: false,
        rewrite: (path) => path.replace(/^\/api\/yt/, '/results')
      }
    }
  }
});