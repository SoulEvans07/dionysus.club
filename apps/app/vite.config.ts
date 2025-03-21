import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const Env = z.object({
  PORT: z.coerce.number(),
});

const env = Env.parse(process.env);

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: env.PORT || 4000,
  },
  plugins: [tsconfigPaths(), react(), tailwindcss()],
});
