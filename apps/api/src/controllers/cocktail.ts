import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { and, eq } from 'drizzle-orm';

import { AddRecipeItemToCocktailDTO, CocktailDTO, CreateCocktailDTO } from '@repo/dtos';
import { cocktails, db, ingredients, recipeItem } from '~/database';
import { getUser } from '~/auth/kinde';

export const cocktailController = new Hono();

cocktailController.get('/list', getUser, async (c) => {
  const user = c.var.user;

  const list = await db.query.cocktails.findMany({
    where: eq(cocktails.ownerId, user.id),
    with: { recipe: { with: { ingredient: true } } },
  });

  const validated = CocktailDTO.array().parse(list);

  return c.json<CocktailDTO[]>(validated);
});

cocktailController.get('/:id', getUser, async (c) => {
  const user = c.var.user;
  const id = c.req.param('id');

  const item = await db.query.cocktails.findFirst({
    where: and(eq(cocktails.id, id), eq(cocktails.ownerId, user.id)),
    with: { recipe: { with: { ingredient: true } } },
  });

  if (!item) return c.status(404);

  const validated = CocktailDTO.parse(item);

  return c.json<CocktailDTO>(validated);
});

cocktailController.post('/create', getUser, zValidator('json', CreateCocktailDTO), async (c) => {
  const owner = c.var.user;
  const body = c.req.valid('json');

  const item = await db.insert(cocktails).values({
    ...body,
    ownerId: owner.id,
  });

  return c.json(item);
});

cocktailController.post(
  '/:cocktailId/recipe/add',
  getUser,
  zValidator('json', AddRecipeItemToCocktailDTO),
  async (c) => {
    const user = c.var.user;
    const cocktailId = c.req.param('cocktailId');
    const { ingredientId, ...item } = c.req.valid('json');

    const cocktail = await db.query.cocktails.findFirst({
      where: and(eq(cocktails.id, cocktailId), eq(cocktails.ownerId, user.id)),
    });

    if (!cocktail) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const ingredient = await db.query.ingredients.findFirst({
      where: and(eq(ingredients.id, ingredientId), eq(ingredients.ownerId, user.id)),
    });

    if (!ingredient) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const result = await db.insert(recipeItem).values({
      ...item,
      cocktailId: cocktail.id,
      ingredientId: ingredient.id,
    });

    return c.json(result);
  }
);

cocktailController.delete('/:cocktailId/recipe/:ingredientId', getUser, async (c) => {
  const user = c.var.user;
  const cocktailId = c.req.param('cocktailId');
  const ingredientId = c.req.param('ingredientId');

  const cocktail = await db.query.cocktails.findFirst({
    where: and(eq(cocktails.id, cocktailId), eq(cocktails.ownerId, user.id)),
  });

  if (!cocktail) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const item = await db.query.recipeItem.findFirst({
    where: and(eq(recipeItem.cocktailId, cocktailId), eq(recipeItem.ingredientId, ingredientId)),
  });

  if (!item) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  await db
    .delete(recipeItem)
    .where(and(eq(recipeItem.cocktailId, cocktailId), eq(recipeItem.ingredientId, ingredientId)));

  return c.json({ success: true });
});
