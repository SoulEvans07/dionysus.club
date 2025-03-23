import { serve } from '@hono/node-server';
// import { serveStatic } from '@hono/node-server/serve-static';
import { app } from './app';

// NOTE: https://www.youtube.com/watch?v=jXyTIQOfTTk&t=165s&pp=ygUJaG9ubyBhdXRo
// app.get('*', serveStatic({ root: '../apps/app/dist'}))
// app.get('*', serveStatic({ root: '../apps/app/dist/index.html'}))

serve(
  {
    fetch: app.fetch,
    port: process.env.PORT ?? 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
