import { createMiddleware } from 'hono/factory';
import { and, eq, isNull } from 'drizzle-orm';

import { hasBarRole, type BarRole } from '@repo/dtos';
import { bars, barUsers, db } from '~/database';
import type { AuthedUser } from '~/auth/kinde';

type Env = {
  Variables: {
    user: AuthedUser;
    bar: typeof bars.$inferSelect;
    role: BarRole;
  };
};

type BarFieldsWith = NonNullable<Parameters<typeof db.query.bars.findFirst>[0]>['with'];

// Resolves the bar a request applies to: the bar named by the `barId` route param,
// or the requesting user's personal bar when no `barId` is present.
// Also resolves the requesting user's role in that bar.
export const getBarWith = (withFields?: BarFieldsWith) => {
  return createMiddleware<Env>(async (c, next) => {
    const user = c.var.user;
    const barId = c.req.param('barId');

    const condition = barId
      ? and(eq(bars.id, barId), isNull(bars.deletedAt))
      : and(eq(bars.ownedBy, user.id), eq(bars.barType, 'personal'), isNull(bars.deletedAt));
    const bar = await db.query.bars.findFirst({ where: condition, with: withFields });

    if (!bar) return c.json({ error: 'Not found' }, 404);

    let role: BarRole = 'owner';
    if (bar.ownedBy !== user.id) {
      const membership = await db.query.barUsers.findFirst({
        where: and(eq(barUsers.barId, bar.id), eq(barUsers.userId, user.id)),
      });

      if (!membership) return c.json({ error: 'Unauthorized' }, 401);
      role = membership.role;
    }

    c.set('bar', bar);
    c.set('role', role);

    return next();
  });
};

// Must run after `getBarWith`.
export const requireBarRole = (atLeast: BarRole) => {
  return createMiddleware<Env>(async (c, next) => {
    if (!hasBarRole(c.var.role, atLeast)) return c.json({ error: 'Unauthorized' }, 401);
    return next();
  });
};
