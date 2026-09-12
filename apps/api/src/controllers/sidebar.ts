import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { and, eq, inArray, isNull, or } from 'drizzle-orm';
import _ from 'lodash';

import { SidebarDTO } from '@repo/dtos';
import { bars, barUsers, db } from '~/database';
import { getUser } from '~/auth/kinde';

export const sidebarController = new Hono();

sidebarController.get('/', getUser, async (c) => {
  const user = c.var.user;

  const memberships = await db.query.barUsers.findMany({ where: eq(barUsers.userId, user.id) });
  const memberBarIds = memberships.map((m) => m.barId);

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

  const personal = list.find((o) => o.barType === 'personal' && o.ownedBy === user.id);
  if (!personal) throw new HTTPException(500, { message: `Can't find personal bar` });

  const sidebar: SidebarDTO = {
    personal,
    groups: [
      {
        index: 0,
        id: 'owned',
        name: 'Owned',
        bars: list.filter((o) => o.ownedBy === user.id && o.barType !== 'personal'),
        color: 'violet',
        icon: 'crown',
      },
      {
        index: 1,
        id: 'member',
        name: 'Member',
        bars: list.filter((o) => o.ownedBy !== user.id),
        color: 'blue',
        icon: 'usersRound',
      },
    ],
  };

  return c.json<SidebarDTO>(sidebar);
});
