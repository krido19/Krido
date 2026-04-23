import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/bayargg': {
        target: 'https://www.bayar.gg',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/bayargg/, '/api'),
      },
      '/pakasir': {
        target: 'https://app.pakasir.com',
        changeOrigin: true,
        secure: false,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://app.pakasir.com/',
          'Accept': 'application/json'
        },
        rewrite: (path) => path.replace(/^\/pakasir/, '/api'),
      }
    }
  }
})

