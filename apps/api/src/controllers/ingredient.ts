import { Hono } from 'hono';
import { eq } from 'drizzle-orm';

import { db, ingredients } from '~/database';

export const ingredientController = new Hono();

ingredientController.get('/list', async (c) => {
  const list = await db.query.ingredients.findMany({
    with: { owner: true },
  });

  return c.json(list);
});

ingredientController.get('/:id', async (c) => {
  const id = c.req.param('id');

  const item = await db.query.ingredients.findFirst({
    where: eq(ingredients.id, id),
    with: { owner: true },
  });

  return c.json(item);
});
