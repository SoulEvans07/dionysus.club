import { createMiddleware } from 'hono/factory';
import { and, eq, isNull } from 'drizzle-orm';

import { bars, barUsers, db } from '~/database';
import type { AuthedUser } from '~/auth/kinde';

type Env = {
  Variables: {
    user: AuthedUser;
    bar: typeof bars.$inferSelect;
  };
};

type BarFieldsWith = NonNullable<Parameters<typeof db.query.bars.findFirst>[0]>['with'];

// Resolves the bar a request applies to: the bar named by the `barId` route param,
// or the requesting user's personal bar when no `barId` is present.
export const getBarWith = (withFields?: BarFieldsWith) => {
  return createMiddleware<Env>(async (c, next) => {
    const user = c.var.user;
    const barId = c.req.param('barId');

    const condition = barId
      ? and(eq(bars.id, barId), isNull(bars.deletedAt))
      : and(eq(bars.ownedBy, user.id), eq(bars.barType, 'personal'), isNull(bars.deletedAt));
    const bar = await db.query.bars.findFirst({ where: condition, with: withFields });

    if (!bar) return c.json({ error: 'Not found' }, 404);

    if (bar.ownedBy !== user.id) {
      const membership = await db.query.barUsers.findFirst({
        where: and(eq(barUsers.barId, bar.id), eq(barUsers.userId, user.id)),
      });

      if (!membership) return c.json({ error: 'Unauthorized' }, 401);
    }

    c.set('bar', bar);

    return next();
  });
};
