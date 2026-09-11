import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { and, eq } from 'drizzle-orm';

import { AddRecipeItemToCocktailDTO, CocktailDTO, CreateCocktailDTO } from '@repo/dtos';
import { cocktails, db, ingredients, recipeItem } from '~/database';
import { getUser } from '~/auth/kinde';
import { getBar } from '~/middleware/bar';

export const cocktailController = new Hono();

cocktailController.get('/list', getUser, getBar, async (c) => {
  const bar = c.var.bar;

  const list = await db.query.cocktails.findMany({
    where: eq(cocktails.barId, bar.id),
    with: { ingredients: { with: { ingredient: true } } },
  });

  const validated = CocktailDTO.array().parse(
    list.map(({ ingredients: recipe, ...cocktail }) => ({ ...cocktail, recipe }))
  );

  return c.json<CocktailDTO[]>(validated);
});

cocktailController.get('/:id', getUser, getBar, async (c) => {
  const bar = c.var.bar;
  const id = c.req.param('id');

  const item = await db.query.cocktails.findFirst({
    where: and(eq(cocktails.id, id), eq(cocktails.barId, bar.id)),
    with: { ingredients: { with: { ingredient: true } } },
  });

  if (!item) return c.json({ error: 'Not found' }, 404);

  const { ingredients: recipe, ...cocktail } = item;
  const validated = CocktailDTO.parse({ ...cocktail, recipe });

  return c.json<CocktailDTO>(validated);
});

cocktailController.post('/create', getUser, getBar, zValidator('json', CreateCocktailDTO), async (c) => {
  const user = c.var.user;
  const bar = c.var.bar;
  const body = c.req.valid('json');

  const [item] = await db
    .insert(cocktails)
    .values({ ...body, barId: bar.id, createdById: user.id, updatedById: user.id })
    .returning();

  return c.json(item);
});

cocktailController.post(
  '/:cocktailId/recipe/add',
  getUser,
  getBar,
  zValidator('json', AddRecipeItemToCocktailDTO),
  async (c) => {
    const bar = c.var.bar;
    const cocktailId = c.req.param('cocktailId');
    const { ingredientId, ...item } = c.req.valid('json');

    const cocktail = await db.query.cocktails.findFirst({
      where: and(eq(cocktails.id, cocktailId), eq(cocktails.barId, bar.id)),
    });

    if (!cocktail) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const ingredient = await db.query.ingredients.findFirst({
      where: and(eq(ingredients.id, ingredientId), eq(ingredients.barId, bar.id)),
    });

    if (!ingredient) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const [result] = await db
      .insert(recipeItem)
      .values({ ...item, cocktailId: cocktail.id, ingredientId: ingredient.id })
      .returning();

    return c.json(result);
  }
);

cocktailController.delete('/:cocktailId/recipe/:ingredientId', getUser, getBar, async (c) => {
  const bar = c.var.bar;
  const cocktailId = c.req.param('cocktailId');
  const ingredientId = c.req.param('ingredientId');

  const cocktail = await db.query.cocktails.findFirst({
    where: and(eq(cocktails.id, cocktailId), eq(cocktails.barId, bar.id)),
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
