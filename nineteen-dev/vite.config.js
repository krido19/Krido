import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'Nineteen Dev',
        short_name: 'Nineteen',
        description: 'Nineteen Dev Premium Web Application',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
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
      },
      '/fdo': {
        target: 'https://api.football-data.org/v4',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/fdo/, ''),
      }
    }
  }
})

