import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [
      react(),
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
