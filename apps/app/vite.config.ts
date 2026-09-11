import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const Env = z.object({
  PORT: z.coerce.number().optional(),
  SERVER_URL: z.string(),
});

const env = Env.parse(process.env);

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: env.PORT || 4000,
    proxy: {
      '/api': {
        target: env.SERVER_URL,
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log(
              '>>>',
              req.method,
              req.url,
              '==>',
              proxyReq.method,
              `${proxyReq.protocol}//${proxyReq.host}${proxyReq.path}`
            );
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('<<<', proxyRes.statusCode, req.url);
          });
        },
      },
    },
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    tsconfigPaths: true,
  },
});
