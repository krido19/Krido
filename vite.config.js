import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
        manifest: {
          name: 'Krido Bahtiar Portfolio',
          short_name: 'Krido KB',
          description: 'Portofolio profesional Krido Bahtiar. Frontend Web Developer spesialis dalam menciptakan pengalaman web modern, cepat, dan interaktif dengan React, Next.js, Astro, Svelte, dan ekosistem modern lainnya.',
          theme_color: '#06b6d4',
          background_color: '#000000',
          display: 'standalone',
          icons: [
            {
              src: 'https://www.kridobahtiar.my.id/logo.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'https://www.kridobahtiar.my.id/logo.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        },
        workbox: {
          runtimeCaching: [
            {
              // Cache API and Supabase requests with NetworkFirst
              urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'supabase-api-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 // 24 hours
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              // Cache static assets (images, fonts) from external sources
              urlPattern: /.*\.(?:png|jpg|jpeg|svg|gif|webp)/,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'image-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 30 * 24 * 60 * 60 // 30 Days
                }
              }
            }
          ]
        }
      }),
      {
        name: 'mock-vercel-api',
        configureServer(server) {
          server.middlewares.use('/api/chat', async (req, res, next) => {
            if (req.method === 'POST') {
               try {
                 // Inject env vars to process.env for standard Node.js reading
                 process.env.GEMINI_API_KEY = env.GEMINI_API_KEY;
                 
                 const { default: handler } = await import('./api/chat.js');
               
               // Read body
               let body = '';
               req.on('data', chunk => {
                  body += chunk.toString();
               });
               
               req.on('end', async () => {
                 req.body = body ? JSON.parse(body) : {};
                 
                 // Mock Vercel Response object
                 const vercelRes = {
                   status: (code) => {
                     res.statusCode = code;
                     return vercelRes;
                   },
                   json: (data) => {
                     res.setHeader('Content-Type', 'application/json');
                     res.end(JSON.stringify(data));
                   }
                 };
                 
                 await handler(req, vercelRes);
               });
             } catch(err) {
               console.error(err);
               res.statusCode = 500;
               res.end('Error loading API handler');
             }
            } else {
               next();
            }
          });
        }
      }
    ],
  };
});
