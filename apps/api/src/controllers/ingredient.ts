import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { and, eq } from 'drizzle-orm';

import { IngredientDTO, CreateIngredientDTO, UpdateIngredientDTO } from '@repo/dtos';
import { db, ingredients } from '~/database';
import { getUser } from '~/auth/kinde';
import { getBarWith } from '~/middleware/bar';

export const ingredientController = new Hono();

ingredientController.get('/list', getUser, getBarWith(), async (c) => {
  const bar = c.var.bar;

  const list = await db.query.ingredients.findMany({
    where: eq(ingredients.barId, bar.id),
  });

  return c.json<IngredientDTO[]>(IngredientDTO.array().parse(list));
});

ingredientController.get('/:id', getUser, getBarWith(), async (c) => {
  const bar = c.var.bar;
  const id = c.req.param('id');

  const item = await db.query.ingredients.findFirst({
    where: and(eq(ingredients.id, id), eq(ingredients.barId, bar.id)),
  });

  if (!item) return c.json({ error: 'Not found' }, 404);

  return c.json<IngredientDTO>(IngredientDTO.parse(item));
});

ingredientController.post('/create', getUser, getBarWith(), zValidator('json', CreateIngredientDTO), async (c) => {
  const user = c.var.user;
  const bar = c.var.bar;
  const body = c.req.valid('json');

  const [item] = await db
    .insert(ingredients)
    .values({ ...body, barId: bar.id, createdById: user.id, updatedById: user.id })
    .returning();

  return c.json(item);
});

ingredientController.put('/update', getUser, getBarWith(), zValidator('json', UpdateIngredientDTO), async (c) => {
  const user = c.var.user;
  const bar = c.var.bar;
  const body = c.req.valid('json');

  const item = await db.query.ingredients.findFirst({
    where: and(eq(ingredients.id, body.id), eq(ingredients.barId, bar.id)),
  });

  if (!item) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  await db
    .update(ingredients)
    .set({ ...body, updatedById: user.id })
    .where(eq(ingredients.id, body.id));

  return c.json({ id: body.id });
});
