import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { and, eq, inArray, isNull, or } from 'drizzle-orm';

import {
  AddBarMemberDTO,
  BarDTO,
  BarRole,
  CreateBarDTO,
  MyBarListDTO,
  UpdateBarDTO,
  UpdateBarMemberDTO,
} from '@repo/dtos';
import { bars, barUsers, db } from '~/database';
import { getUser, type AuthedUser } from '~/auth/kinde';
import { getBar } from '~/middleware/bar';

export const barController = new Hono();

async function isBarAdmin(barId: string, ownedBy: string, user: AuthedUser) {
  if (ownedBy === user.id) return true;

  const membership = await db.query.barUsers.findFirst({
    where: and(eq(barUsers.barId, barId), eq(barUsers.userId, user.id), eq(barUsers.role, 'admin')),
  });

  return !!membership;
}

barController.get('/list', getUser, async (c) => {
  const user = c.var.user;

  const memberships = await db.query.barUsers.findMany({ where: eq(barUsers.userId, user.id) });
  const memberBarIds = memberships.map((m) => m.barId);
  const membershipByBarId = memberships.reduce(
    (acc, curr) => {
      return { ...acc, [curr.barId]: curr.role };
    },
    {} as Record<string, BarRole>
  );

  const list = await db.query.bars.findMany({
    where: and(
      isNull(bars.deletedAt),
      or(eq(bars.ownedBy, user.id), memberBarIds.length ? inArray(bars.id, memberBarIds) : undefined)
    ),
    with: {
      logoImage: true,
      bannerImage: true,
    }
  });

  const mylist: MyBarListDTO[] = list.map((bar): MyBarListDTO => {
    const role: BarRole = bar.ownedBy === user.id ? 'owner' : membershipByBarId[bar.id];
    if (!role) throw new Error('Failed to match role to bar');
    return { ...bar, role };
  });

  return c.json<MyBarListDTO[]>(mylist);
});

barController.post('/create', getUser, zValidator('json', CreateBarDTO), async (c) => {
  const user = c.var.user;
  const body = c.req.valid('json');

  const [item] = await db
    .insert(bars)
    .values({ ...body, ownedBy: user.id, createdById: user.id, updatedById: user.id })
    .returning();

  return c.json<BarDTO>(BarDTO.parse(item));
});

// `getBar` doubles as the "does this user have access to :barId" check for a
// bar's own CRUD routes here, same as it does for ingredients/cocktails/menus.
barController.get('/:barId', getUser, getBar, async (c) => {
  return c.json<BarDTO>(BarDTO.parse(c.var.bar));
});

barController.put('/:barId', getUser, getBar, zValidator('json', UpdateBarDTO), async (c) => {
  const user = c.var.user;
  const bar = c.var.bar;
  const body = c.req.valid('json');

  if (!(await isBarAdmin(bar.id, bar.ownedBy, user))) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  await db
    .update(bars)
    .set({ ...body, updatedById: user.id })
    .where(eq(bars.id, bar.id));

  return c.json({ id: bar.id });
});

barController.delete('/:barId', getUser, getBar, async (c) => {
  const user = c.var.user;
  const bar = c.var.bar;

  if (bar.ownedBy !== user.id) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  if (bar.barType === 'personal') {
    return c.json({ error: 'A personal bar cannot be deleted' }, 400);
  }

  await db.update(bars).set({ deletedAt: new Date(), deletedById: user.id }).where(eq(bars.id, bar.id));

  return c.json({ success: true });
});

barController.get('/:barId/members', getUser, getBar, async (c) => {
  const bar = c.var.bar;

  const members = await db.query.barUsers.findMany({
    where: eq(barUsers.barId, bar.id),
    with: { user: { columns: { id: true, username: true, email: true } } },
  });

  return c.json(members);
});

barController.post('/:barId/members', getUser, getBar, zValidator('json', AddBarMemberDTO), async (c) => {
  const user = c.var.user;
  const bar = c.var.bar;
  const body = c.req.valid('json');

  if (!(await isBarAdmin(bar.id, bar.ownedBy, user))) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  await db
    .insert(barUsers)
    .values({ barId: bar.id, userId: body.userId, role: body.role })
    .onConflictDoUpdate({ target: [barUsers.barId, barUsers.userId], set: { role: body.role } });

  return c.json({ success: true });
});

barController.put('/:barId/members/:userId', getUser, getBar, zValidator('json', UpdateBarMemberDTO), async (c) => {
  const user = c.var.user;
  const bar = c.var.bar;
  const targetUserId = c.req.param('userId');
  const body = c.req.valid('json');

  if (!(await isBarAdmin(bar.id, bar.ownedBy, user))) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  await db
    .update(barUsers)
    .set({ role: body.role })
    .where(and(eq(barUsers.barId, bar.id), eq(barUsers.userId, targetUserId)));

  return c.json({ success: true });
});

barController.delete('/:barId/members/:userId', getUser, getBar, async (c) => {
  const user = c.var.user;
  const bar = c.var.bar;
  const targetUserId = c.req.param('userId');

  if (!(await isBarAdmin(bar.id, bar.ownedBy, user))) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  await db.delete(barUsers).where(and(eq(barUsers.barId, bar.id), eq(barUsers.userId, targetUserId)));

  return c.json({ success: true });
});
