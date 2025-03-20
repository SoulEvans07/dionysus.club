import { serve } from '@hono/node-server';
import { Hono } from 'hono';

import { TestType } from '@repo/dtos';
import { random } from './random';

import '~/env';
import { db, sql } from './database';

const app = new Hono();

app.get('/', c => {
  const q = c.req.query();
  const { name } = TestType.parse(q);

  return c.json({ message: `Hello ${name ?? 'Hono'}! ${random()}` });
});

app.get('/ingredients', async c => {
  const list = await db.query.ingredients.findMany({});
  return c.json(list);
});

app.get('/api/health', c => {
  return c.json({ healthy: true });
});

serve(
  {
    fetch: app.fetch,
    port: process.env.PORT ?? 3000,
  },
  info => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
