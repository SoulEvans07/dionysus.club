import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { and, eq, inArray, isNull, or } from 'drizzle-orm';
import _ from 'lodash';
import {
  AddBarMemberDTO,
  BarDTO,
  BarRole,
  CreateBarDTO,
  BarWithRoleDTO,
  UpdateBarDTO,
  UpdateBarMemberDTO,
  GetBarMemberDTO,
} from '@repo/dtos';
import { bars, barUsers, db, users } from '~/database';
import { getUser, type AuthedUser } from '~/auth/kinde';
import { getBarWith } from '~/middleware/bar';
import { HTTPException } from 'hono/http-exception';

export const barController = new Hono();

async function getBarRole(bar: { id: string; ownedBy: string }, user: { id: string }): Promise<BarRole | null> {
  if (bar.ownedBy === user.id) return 'owner';

  const membership = await db.query.barUsers.findFirst({
    where: and(eq(barUsers.barId, bar.id), eq(barUsers.userId, user.id)),
  });

  return membership?.role ?? null;
}

async function isBarAdmin(bar: { id: string; ownedBy: string }, user: AuthedUser): Promise<boolean> {
  const role = await getBarRole(bar, user);
  if (!role) return false;
  return ['owner', 'admin'].includes(role);
}

barController.get('/list', getUser, async (c) => {
  const user = c.var.user;

  const memberships = await db.query.barUsers.findMany({ where: eq(barUsers.userId, user.id) });
  const memberBarIds = memberships.map((m) => m.barId);
  const membershipByBarId = memberships.reduce(
    (acc, curr) => ({ ...acc, [curr.barId]: curr.role }),
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
    },
  });

  const mylist: BarWithRoleDTO[] = list.map((bar): BarWithRoleDTO => {
    const role: BarRole = bar.ownedBy === user.id ? 'owner' : membershipByBarId[bar.id];
    if (!role) throw new Error('Failed to match role to bar');
    return { ...bar, role };
  });

  return c.json<BarWithRoleDTO[]>(mylist);
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
barController.get('/:barId', getUser, getBarWith({ logoImage: true, bannerImage: true }), async (c) => {
  const role = await getBarRole(c.var.bar, c.var.user);

  if (!role) return c.json({ error: 'Unauthorized' }, 401);

  return c.json<BarDTO>(BarWithRoleDTO.parse({ ...c.var.bar, role }));
});

barController.put('/:barId', getUser, getBarWith(), zValidator('json', UpdateBarDTO), async (c) => {
  const user = c.var.user;
  const bar = c.var.bar;
  const body = c.req.valid('json');

  if (!(await isBarAdmin(bar, user))) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  await db
    .update(bars)
    .set({ ...body, updatedById: user.id })
    .where(eq(bars.id, bar.id));

  return c.json({ id: bar.id });
});

barController.delete('/:barId', getUser, getBarWith(), async (c) => {
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

barController.get('/:barId/members', getUser, getBarWith(), async (c) => {
  const bar = c.var.bar;

  const owner = await db.query.users.findFirst({ where: eq(users.id, bar.ownedBy), with: { profileImage: true } });
  if (!owner) throw new HTTPException(500, { message: `Can't find owner of ${bar.id}` });

  const members = await db.query.barUsers.findMany({
    where: eq(barUsers.barId, bar.id),
    with: { user: { with: { profileImage: true } } },
  });

  return c.json<GetBarMemberDTO[]>([{ barId: bar.id, userId: owner.id, role: 'owner', user: owner }, ...members]);
});

barController.post('/:barId/members', getUser, getBarWith(), zValidator('json', AddBarMemberDTO), async (c) => {
  const user = c.var.user;
  const bar = c.var.bar;
  const body = c.req.valid('json');

  if (!(await isBarAdmin(bar, user))) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  await db
    .insert(barUsers)
    .values({ barId: bar.id, userId: body.userId, role: body.role })
    .onConflictDoUpdate({ target: [barUsers.barId, barUsers.userId], set: { role: body.role } });

  return c.json({ success: true });
});

barController.put(
  '/:barId/members/:userId',
  getUser,
  getBarWith(),
  zValidator('json', UpdateBarMemberDTO),
  async (c) => {
    const user = c.var.user;
    const bar = c.var.bar;
    const targetUserId = c.req.param('userId');
    const body = c.req.valid('json');

    if (!(await isBarAdmin(bar, user))) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    await db
      .update(barUsers)
      .set({ role: body.role })
      .where(and(eq(barUsers.barId, bar.id), eq(barUsers.userId, targetUserId)));

    return c.json({ success: true });
  }
);

barController.delete('/:barId/members/:userId', getUser, getBarWith(), async (c) => {
  const user = c.var.user;
  const bar = c.var.bar;
  const targetUserId = c.req.param('userId');

  if (!(await isBarAdmin(bar, user))) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  await db.delete(barUsers).where(and(eq(barUsers.barId, bar.id), eq(barUsers.userId, targetUserId)));

  return c.json({ success: true });
});
