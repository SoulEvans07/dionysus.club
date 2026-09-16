import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { and, eq } from 'drizzle-orm';

import { AddRecipeItemToCocktailDTO, CocktailDTO, CreateCocktailDTO } from '@repo/dtos';
import { cocktails, cocktailTags, db, ingredients, recipeItem } from '~/database';
import { getUser } from '~/auth/kinde';
import { getBarWith } from '~/middleware/bar';
import { findAssignableTag } from './tag';

export const cocktailController = new Hono();

cocktailController.get('/list', getUser, getBarWith(), async (c) => {
  const bar = c.var.bar;

  const list = await db.query.cocktails.findMany({
    where: eq(cocktails.barId, bar.id),
    with: {
      ingredients: {
        with: {
          ingredient: {
            with: {
              iconImage: true,
              cardImage: true,
              tags: { with: { tag: true } },
            },
          },
        },
      },
      tags: { with: { tag: true } },
    },
  });

  const validated = CocktailDTO.array().parse(
    list.map(({ ingredients: recipe, tags, ...cocktail }) => ({
      ...cocktail,
      tags: tags.map((t) => t.tag),
      recipe: recipe.map(({ ingredient, ...item }) => ({
        ...item,
        ingredient: { ...ingredient, tags: ingredient.tags.map((t) => t.tag) },
      })),
    }))
  );

  return c.json<CocktailDTO[]>(validated);
});

cocktailController.get('/:id', getUser, getBarWith(), async (c) => {
  const bar = c.var.bar;
  const id = c.req.param('id');

  const item = await db.query.cocktails.findFirst({
    where: and(eq(cocktails.id, id), eq(cocktails.barId, bar.id)),
    with: {
      ingredients: {
        with: {
          ingredient: {
            with: {
              iconImage: true,
              cardImage: true,
              tags: { with: { tag: true } },
            },
          },
        },
      },
      tags: { with: { tag: true } },
    },
  });

  if (!item) return c.json({ error: 'Not found' }, 404);

  const { ingredients: recipe, tags, ...cocktail } = item;
  const validated = CocktailDTO.parse({
    ...cocktail,
    tags: tags.map((t) => t.tag),
    recipe: recipe.map(({ ingredient, ...line }) => ({
      ...line,
      ingredient: { ...ingredient, tags: ingredient.tags.map((t) => t.tag) },
    })),
  });

  return c.json<CocktailDTO>(validated);
});

cocktailController.post('/create', getUser, getBarWith(), zValidator('json', CreateCocktailDTO), async (c) => {
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
  getBarWith(),
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

cocktailController.delete('/:cocktailId/recipe/:ingredientId', getUser, getBarWith(), async (c) => {
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

cocktailController.post('/:cocktailId/tags/:tagId', getUser, getBarWith(), async (c) => {
  const bar = c.var.bar;
  const cocktailId = c.req.param('cocktailId');
  const tagId = c.req.param('tagId');

  const cocktail = await db.query.cocktails.findFirst({
    where: and(eq(cocktails.id, cocktailId), eq(cocktails.barId, bar.id)),
  });
  if (!cocktail) return c.json({ error: 'Unauthorized' }, 401);

  const tag = await findAssignableTag(bar.id, tagId, ['cocktail', 'both']);
  if (!tag) return c.json({ error: 'Unauthorized' }, 401);

  await db.insert(cocktailTags).values({ cocktailId: cocktail.id, tagId: tag.id }).onConflictDoNothing();

  return c.json({ success: true });
});

cocktailController.delete('/:cocktailId/tags/:tagId', getUser, getBarWith(), async (c) => {
  const bar = c.var.bar;
  const cocktailId = c.req.param('cocktailId');
  const tagId = c.req.param('tagId');

  const cocktail = await db.query.cocktails.findFirst({
    where: and(eq(cocktails.id, cocktailId), eq(cocktails.barId, bar.id)),
  });
  if (!cocktail) return c.json({ error: 'Unauthorized' }, 401);

  await db.delete(cocktailTags).where(and(eq(cocktailTags.cocktailId, cocktailId), eq(cocktailTags.tagId, tagId)));

  return c.json({ success: true });
});
