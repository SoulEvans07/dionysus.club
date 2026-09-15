import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { and, eq, isNull, or } from 'drizzle-orm';

import { CreateTagDTO, TagDTO, TagType, UpdateTagDTO } from '@repo/dtos';
import { cocktailTags, db, ingredientTags, tags } from '~/database';
import { SYSTEM_BAR_ID } from '~/database/constants';
import { getUser } from '~/auth/kinde';
import { getBarWith } from '~/middleware/bar';

export const tagController = new Hono();

// A bar can see its own tags plus the global defaults owned by the system bar.
const visibleToBar = (barId: string) => or(eq(tags.barId, barId), eq(tags.barId, SYSTEM_BAR_ID));

// https://www.postgresql.org/docs/current/errcodes-appendix.html
const PG_ERROR_CODE_UNIQUE_VIOLATION = '23505';

function isUniqueViolation(error: unknown): boolean {
  return (
    error instanceof Error && 'code' in error && (error as { code?: unknown }).code === PG_ERROR_CODE_UNIQUE_VIOLATION
  );
}

// Used by cocktail/ingredient controllers when attaching a tag: it must be visible to the
// bar (its own, or a global default) and its type must allow the resource being tagged.
export async function findAssignableTag(barId: string, tagId: string, allowedTypes: TagType[]) {
  const tag = await db.query.tags.findFirst({
    where: and(eq(tags.id, tagId), visibleToBar(barId), isNull(tags.deletedAt)),
  });

  if (!tag || !allowedTypes.includes(tag.type)) return null;

  return tag;
}

tagController.get('/list', getUser, getBarWith(), async (c) => {
  const bar = c.var.bar;

  const list = await db.query.tags.findMany({
    where: and(visibleToBar(bar.id), isNull(tags.deletedAt)),
  });

  return c.json<TagDTO[]>(TagDTO.array().parse(list));
});

tagController.get('/:id', getUser, getBarWith(), async (c) => {
  const bar = c.var.bar;
  const id = c.req.param('id');

  const item = await db.query.tags.findFirst({
    where: and(eq(tags.id, id), visibleToBar(bar.id), isNull(tags.deletedAt)),
  });

  if (!item) return c.json({ error: 'Not found' }, 404);

  return c.json<TagDTO>(TagDTO.parse(item));
});

tagController.post('/create', getUser, getBarWith(), zValidator('json', CreateTagDTO), async (c) => {
  const user = c.var.user;
  const bar = c.var.bar;
  const body = c.req.valid('json');

  try {
    const [item] = await db
      .insert(tags)
      .values({ ...body, barId: bar.id, createdById: user.id, updatedById: user.id })
      .returning();

    return c.json<TagDTO>(TagDTO.parse(item));
  } catch (error) {
    if (isUniqueViolation(error)) {
      return c.json({ error: 'A tag with this type, namespace, and key already exists' }, 409);
    }
    throw error;
  }
});

tagController.put('/update', getUser, getBarWith(), zValidator('json', UpdateTagDTO), async (c) => {
  const user = c.var.user;
  const bar = c.var.bar;
  const body = c.req.valid('json');

  const item = await db.query.tags.findFirst({
    where: and(eq(tags.id, body.id), eq(tags.barId, bar.id), isNull(tags.deletedAt)),
  });

  if (!item) return c.json({ error: 'Unauthorized' }, 401);

  try {
    await db
      .update(tags)
      .set({ ...body, updatedById: user.id })
      .where(eq(tags.id, body.id));
  } catch (error) {
    if (isUniqueViolation(error)) {
      return c.json({ error: 'A tag with this type, namespace, and key already exists' }, 409);
    }
    throw error;
  }

  return c.json({ id: body.id });
});

tagController.delete('/:id', getUser, getBarWith(), async (c) => {
  const user = c.var.user;
  const bar = c.var.bar;
  const id = c.req.param('id');

  // Only the bar's own tags can be deleted here - global defaults aren't bar-editable yet.
  const item = await db.query.tags.findFirst({
    where: and(eq(tags.id, id), eq(tags.barId, bar.id), isNull(tags.deletedAt)),
  });

  if (!item) return c.json({ error: 'Unauthorized' }, 401);

  // Tags are soft-deleted, so the cocktail_tags/ingredient_tags FK cascade never fires -
  // detach it from everything it's on explicitly instead.
  await db.delete(cocktailTags).where(eq(cocktailTags.tagId, id));
  await db.delete(ingredientTags).where(eq(ingredientTags.tagId, id));
  await db.update(tags).set({ deletedAt: new Date(), deletedById: user.id }).where(eq(tags.id, id));

  return c.json({ success: true });
});
