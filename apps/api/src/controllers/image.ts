import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { and, eq, isNull } from 'drizzle-orm';

import { CreateImageDTO, ImageDTO } from '@repo/dtos';
import { db, imageBlobs } from '~/database';
import { getUser } from '~/auth/kinde';

export const imageController = new Hono();

// Images aren't bar-scoped: an ImageBlob belongs to whoever uploaded it (see
// libs/entities model.ts for why the same asset can back multiple entities).
imageController.get('/list', getUser, async (c) => {
  const user = c.var.user;

  const list = await db.query.imageBlobs.findMany({
    where: and(eq(imageBlobs.createdById, user.id), isNull(imageBlobs.deletedAt)),
  });

  return c.json<ImageDTO[]>(ImageDTO.array().parse(list));
});

imageController.get('/:id', getUser, async (c) => {
  const user = c.var.user;
  const id = c.req.param('id');

  const item = await db.query.imageBlobs.findFirst({
    where: and(eq(imageBlobs.id, id), eq(imageBlobs.createdById, user.id), isNull(imageBlobs.deletedAt)),
  });

  if (!item) return c.json({ error: 'Not found' }, 404);

  return c.json<ImageDTO>(ImageDTO.parse(item));
});

// Registers an asset the client already uploaded to storage (e.g. UploadThing)
// as an ImageBlob so it can be referenced by other entities.
imageController.post('/create', getUser, zValidator('json', CreateImageDTO), async (c) => {
  const user = c.var.user;
  const body = c.req.valid('json');

  const [item] = await db
    .insert(imageBlobs)
    .values({ ...body, createdById: user.id, updatedById: user.id })
    .returning();

  return c.json(ImageDTO.parse(item));
});

imageController.delete('/:id', getUser, async (c) => {
  const user = c.var.user;
  const id = c.req.param('id');

  const item = await db.query.imageBlobs.findFirst({
    where: and(eq(imageBlobs.id, id), eq(imageBlobs.createdById, user.id), isNull(imageBlobs.deletedAt)),
  });

  if (!item) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  await db.update(imageBlobs).set({ deletedAt: new Date(), deletedById: user.id }).where(eq(imageBlobs.id, id));

  return c.json({ success: true });
});
