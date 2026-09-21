import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { and, or, eq, exists, sql } from 'drizzle-orm';

import {
  AddRecipeItemToCocktailDTO,
  CocktailDTO,
  CocktailListQueryParams,
  CreateCocktailDTO,
  SYSTEM_BAR_ID,
} from '@repo/dtos';
import { cocktails, cocktailTags, tags, db, ingredients, recipeItem } from '~/database';
import { getUser } from '~/auth/kinde';
import { getBarWith } from '~/middleware/bar';
import { findAssignableTag } from './tag';
import { splitToTagParts, type TagNSKey } from '~/utils/tag';

export const cocktailController = new Hono();

function tagsMatch(wanted: TagNSKey[]) {
  return or(...wanted.map((t) => and(eq(tags.namespace, t.namespace), eq(tags.key, t.key))));
}

function tagExists(barId: string, wanted: TagNSKey[], mode: 'AND' | 'OR' = 'AND') {
  const sub = db
    .select({ n: sql`1` })
    .from(cocktailTags)
    .innerJoin(tags, eq(tags.id, cocktailTags.tagId))
    .where(
      and(
        eq(cocktailTags.cocktailId, cocktails.id), // correlate to outer cocktail
        or(eq(tags.barId, barId), eq(tags.barId, SYSTEM_BAR_ID)),
        tagsMatch(wanted)
      )
    );

  return exists(
    mode === 'AND'
      ? sub
          .groupBy(cocktailTags.cocktailId)
          .having(sql`count(distinct ${tags.namespace} || ':' || ${tags.key}) = ${wanted.length}`)
      : sub
  );
}

const cocktailWith = {
  iconImage: true,
  cardImage: true,
  ingredients: {
    orderBy: (item, { asc }) => asc(item.index),
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
  steps: {
    orderBy: (step, { asc }) => asc(step.index),
    with: { image: true },
  },
  tags: { with: { tag: true } },
} satisfies NonNullable<Parameters<typeof db.query.cocktails.findFirst>[0]>['with'];

type CocktailRow = NonNullable<Awaited<ReturnType<typeof db.query.cocktails.findFirst<{ with: typeof cocktailWith }>>>>;

function toCocktailDTO({ ingredients: recipe, tags, ...cocktail }: CocktailRow) {
  return {
    ...cocktail,
    tags: tags.map((t) => t.tag),
    recipe: recipe.map(({ ingredient, ...item }) => ({
      ...item,
      ingredient: { ...ingredient, tags: ingredient.tags.map((t) => t.tag) },
    })),
  };
}

cocktailController.get('/list', getUser, getBarWith(), zValidator('query', CocktailListQueryParams), async (c) => {
  const bar = c.var.bar;
  const { tag } = c.req.valid('query');

  const conditions = [eq(cocktails.barId, bar.id)];
  if (tag) conditions.push(tagExists(bar.id, [splitToTagParts(tag)], 'AND'));

  const list = await db.query.cocktails.findMany({
    where: and(...conditions),
    with: cocktailWith,
  });

  const validated = CocktailDTO.array().parse(list.map(toCocktailDTO));

  return c.json<CocktailDTO[]>(validated);
});

cocktailController.get('/:id', getUser, getBarWith(), async (c) => {
  const bar = c.var.bar;
  const id = c.req.param('id');

  const item = await db.query.cocktails.findFirst({
    where: and(eq(cocktails.id, id), eq(cocktails.barId, bar.id)),
    with: cocktailWith,
  });

  if (!item) return c.json({ error: 'Not found' }, 404);

  const validated = CocktailDTO.parse(toCocktailDTO(item));

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
