import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { and, eq } from 'drizzle-orm';

import { IngredientDTO, CreateIngredientDTO, UpdateIngredientDTO } from '@repo/dtos';
import { db, ingredients, ingredientTags } from '~/database';
import { getUser } from '~/auth/kinde';
import { getBarWith } from '~/middleware/bar';
import { findAssignableTag } from './tag';

export const ingredientController = new Hono();

ingredientController.get('/list', getUser, getBarWith(), async (c) => {
  const bar = c.var.bar;

  const list = await db.query.ingredients.findMany({
    where: eq(ingredients.barId, bar.id),
    with: { tags: { with: { tag: true } } },
  });

  const validated = IngredientDTO.array().parse(
    list.map(({ tags, ...ingredient }) => ({ ...ingredient, tags: tags.map((t) => t.tag) }))
  );

  return c.json<IngredientDTO[]>(validated);
});

ingredientController.get('/:id', getUser, getBarWith(), async (c) => {
  const bar = c.var.bar;
  const id = c.req.param('id');

  const item = await db.query.ingredients.findFirst({
    where: and(eq(ingredients.id, id), eq(ingredients.barId, bar.id)),
    with: { tags: { with: { tag: true } } },
  });

  if (!item) return c.json({ error: 'Not found' }, 404);

  const { tags, ...ingredient } = item;
  const validated = IngredientDTO.parse({ ...ingredient, tags: tags.map((t) => t.tag) });

  return c.json<IngredientDTO>(validated);
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

ingredientController.post('/:id/tags/:tagId', getUser, getBarWith(), async (c) => {
  const bar = c.var.bar;
  const id = c.req.param('id');
  const tagId = c.req.param('tagId');

  const ingredient = await db.query.ingredients.findFirst({
    where: and(eq(ingredients.id, id), eq(ingredients.barId, bar.id)),
  });
  if (!ingredient) return c.json({ error: 'Unauthorized' }, 401);

  const tag = await findAssignableTag(bar.id, tagId, ['ingredient', 'both']);
  if (!tag) return c.json({ error: 'Unauthorized' }, 401);

  await db.insert(ingredientTags).values({ ingredientId: ingredient.id, tagId: tag.id }).onConflictDoNothing();

  return c.json({ success: true });
});

ingredientController.delete('/:id/tags/:tagId', getUser, getBarWith(), async (c) => {
  const bar = c.var.bar;
  const id = c.req.param('id');
  const tagId = c.req.param('tagId');

  const ingredient = await db.query.ingredients.findFirst({
    where: and(eq(ingredients.id, id), eq(ingredients.barId, bar.id)),
  });
  if (!ingredient) return c.json({ error: 'Unauthorized' }, 401);

  await db.delete(ingredientTags).where(and(eq(ingredientTags.ingredientId, id), eq(ingredientTags.tagId, tagId)));

  return c.json({ success: true });
});
