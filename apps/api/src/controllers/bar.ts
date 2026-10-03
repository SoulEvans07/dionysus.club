import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { and, eq, inArray, isNull, or, sql } from 'drizzle-orm';
import _ from 'lodash';
import {
  AddBarMemberDTO,
  BarDTO,
  BarRole,
  canManageBarRole,
  CreateBarDTO,
  BarWithRoleDTO,
  UpdateBarDTO,
  UpdateBarMemberDTO,
  GetBarMemberDTO,
} from '@repo/dtos';
import { bars, barUsers, db, users } from '~/database';
import { getUser, type AuthedUser } from '~/auth/kinde';
import { getBarWith } from '~/middleware/bar';
import { publicUserQuery } from '~/utils/user';
import { HTTPException } from 'hono/http-exception';

export const barController = new Hono();

async function getBarRole(bar: { id: string; ownedBy: string }, user: { id: string }): Promise<BarRole | null> {
  if (bar.ownedBy === user.id) return 'owner';

  const membership = await db.query.barUsers.findFirst({
    where: and(eq(barUsers.barId, bar.id), eq(barUsers.userId, user.id)),
  });

  return membership?.role ?? null;
}

function isAdminRole(role: BarRole | null): boolean {
  return role === 'owner' || role === 'admin';
}

async function isBarAdmin(bar: { id: string; ownedBy: string }, user: AuthedUser): Promise<boolean> {
  return isAdminRole(await getBarRole(bar, user));
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

  const owner = await db.query.users.findFirst({ where: eq(users.id, bar.ownedBy), ...publicUserQuery });
  if (!owner) throw new HTTPException(500, { message: `Can't find owner of ${bar.id}` });

  const members = await db.query.barUsers.findMany({
    where: eq(barUsers.barId, bar.id),
    with: { user: publicUserQuery },
  });

  // Highest role first (in `BarRole` order), then alphabetical, so clients can group without re-sorting.
  const sorted = _.sortBy(members, [(m) => BarRole.options.indexOf(m.role), (m) => m.user.username.toLowerCase()]);

  return c.json<GetBarMemberDTO[]>([{ barId: bar.id, userId: owner.id, role: 'owner', user: owner }, ...sorted]);
});

barController.post('/:barId/members', getUser, getBarWith(), zValidator('json', AddBarMemberDTO), async (c) => {
  const user = c.var.user;
  const bar = c.var.bar;
  const body = c.req.valid('json');

  const role = await getBarRole(bar, user);
  if (!isAdminRole(role)) return c.json({ error: 'Unauthorized' }, 401);
  if (!canManageBarRole(role, body.role)) return c.json({ error: 'Only the owner can add admins' }, 403);
  if (bar.barType === 'personal') return c.json({ error: 'A personal bar cannot have members' }, 400);

  const target = await db.query.users.findFirst({
    where: and(eq(sql`lower(${users.email})`, body.email.toLowerCase()), isNull(users.deletedAt)),
  });
  if (!target) return c.json({ error: 'No user with that email' }, 404);
  if (target.id === bar.ownedBy) return c.json({ error: 'This user owns the bar' }, 409);

  // Changing an existing member's role is the PUT's job, so an existing row is a conflict here.
  const [inserted] = await db
    .insert(barUsers)
    .values({ barId: bar.id, userId: target.id, role: body.role })
    .onConflictDoNothing()
    .returning();
  if (!inserted) return c.json({ error: 'This user is already a member' }, 409);

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

    const role = await getBarRole(bar, user);
    if (!isAdminRole(role)) return c.json({ error: 'Unauthorized' }, 401);
    if (targetUserId === bar.ownedBy) return c.json({ error: "The owner's role cannot be changed" }, 400);

    const target = await getBarRole(bar, { id: targetUserId });
    if (!target) return c.json({ error: 'Not found' }, 404);
    // Both ends count: an admin can neither demote another admin nor promote anyone to admin.
    if (!canManageBarRole(role, target) || !canManageBarRole(role, body.role)) {
      return c.json({ error: 'Only the owner can manage admins' }, 403);
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

  const role = await getBarRole(bar, user);
  if (!isAdminRole(role)) return c.json({ error: 'Unauthorized' }, 401);
  if (targetUserId === bar.ownedBy) return c.json({ error: 'The owner cannot be removed' }, 400);

  const target = await getBarRole(bar, { id: targetUserId });
  if (!target) return c.json({ error: 'Not found' }, 404);
  if (!canManageBarRole(role, target)) return c.json({ error: 'Only the owner can remove admins' }, 403);

  await db.delete(barUsers).where(and(eq(barUsers.barId, bar.id), eq(barUsers.userId, targetUserId)));

  return c.json({ success: true });
});
