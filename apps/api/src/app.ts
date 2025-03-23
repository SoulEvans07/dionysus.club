import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

import '~/env';
import { db, sql } from '~/database';
import { getUser, kindeAuthController } from './auth/kinde';
import { ingredientController } from './controllers/ingredient';

export const app = new Hono().basePath('/api');

app.use('*', logger());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
  })
);

app.get('/health', async (c) => {
  const { rows } = await db.execute(sql`select now()`);
  return c.json({ healthy: true, dbTime: rows[0].now });
});

app.route('/auth', kindeAuthController);

app.get('/test', getUser, async c => {
  return c.json({ user: c.var.user });
})

app.route('/ingredients', ingredientController);
