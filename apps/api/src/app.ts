import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

import '~/env';
import { db, sql } from '~/database';
import { getUser, kindeAuthController } from './auth/kinde';
import { sidebarController } from './controllers/sidebar';
import { ingredientController } from './controllers/ingredient';
import { cocktailController } from './controllers/cocktail';
import { barController } from './controllers/bar';
import { menuController } from './controllers/menu';
import { imageController } from './controllers/image';
import { tagController } from './controllers/tag';

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

app.get('/test', getUser, async (c) => c.json({ user: c.var.user }));
app.get('/ping', getUser, async (c) => c.json({ ping: 'pong' }));

app.route('/sidebar', sidebarController);

app.route('/bars', barController);

app.route('/bars/:barId/ingredients', ingredientController);
app.route('/ingredients', ingredientController);

app.route('/bars/:barId/cocktails', cocktailController);
app.route('/cocktails', cocktailController);

app.route('/bars/:barId/menus', menuController);
app.route('/menus', menuController);

app.route('/bars/:barId/tags', tagController);
app.route('/tags', tagController);

app.route('/images', imageController);
