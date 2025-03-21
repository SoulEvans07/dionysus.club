import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';

import { random } from './random';

import '~/env';
import { db, sql } from '~/database';
import { ingredientController } from './controllers/ingredient';

const app = new Hono().basePath('/api');
app.use(
  cors({
    origin: process.env.CLIENT_URL,
  })
);

app.get('/health', async (c) => {
  const { rows } = await db.execute(sql`select now()`);
  return c.json({ healthy: true, dbTime: rows[0].now });
});

app.route('/ingredients', ingredientController);

serve(
  {
    fetch: app.fetch,
    port: process.env.PORT ?? 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
