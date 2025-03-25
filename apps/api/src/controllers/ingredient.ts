import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { and, eq } from 'drizzle-orm';

import { IngredientDTO, CreateIngredientDTO, UpdateIngredientDTO } from '@repo/dtos';
import { db, ingredients } from '~/database';
import { getUser } from '~/auth/kinde';

export const ingredientController = new Hono();

ingredientController.get('/list', getUser, async (c) => {
  const user = c.var.user;

  const list = await db.query.ingredients.findMany({
    where: eq(ingredients.ownerId, user.id),
  });

  return c.json<IngredientDTO[]>(list);
});

ingredientController.get('/:id', getUser, async (c) => {
  const user = c.var.user;
  const id = c.req.param('id');

  const item = await db.query.ingredients.findFirst({
    where: and(eq(ingredients.id, id), eq(ingredients.ownerId, user.id)),
  });

  if (!item) return c.status(404);

  return c.json<IngredientDTO>(item);
});

ingredientController.post('/create', getUser, zValidator('json', CreateIngredientDTO), async (c) => {
  const owner = c.var.user;
  const body = c.req.valid('json');

  const item = await db.insert(ingredients).values({
    ...body,
    ownerId: owner.id,
  });

  return c.json(item);
});

ingredientController.put('/update', getUser, zValidator('json', UpdateIngredientDTO), async (c) => {
  const user = c.var.user;
  const body = c.req.valid('json');

  const item = await db.query.ingredients.findFirst({
    where: and(eq(ingredients.id, body.id), eq(ingredients.ownerId, user.id)),
  });

  if (!item) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  await db.update(ingredients).set(body).where(eq(ingredients.id, body.id));

  return c.json({ id: body.id });
});
