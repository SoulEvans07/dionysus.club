import { Hono } from 'hono';
import { eq } from 'drizzle-orm';

import { IngredientDTO } from '@repo/dtos';
import { db, ingredients } from '~/database';

export const ingredientController = new Hono();

ingredientController.get('/list', async (c) => {
  const userId = '9b011521-caa0-4d21-d936-38344a1c6e52'

  const list = await db.query.ingredients.findMany({
    where: eq(ingredients.ownerId, userId)
  });

  return c.json<IngredientDTO[]>(list);
});

ingredientController.get('/:id', async (c) => {
  const id = c.req.param('id');

  const item = await db.query.ingredients.findFirst({
    where: eq(ingredients.id, id),
    with: { owner: true },
  });

  if (!item) return c.status(404);

  return c.json<IngredientDTO>(item);
});
