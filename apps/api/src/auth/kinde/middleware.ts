import { createMiddleware } from 'hono/factory';
import { eq } from 'drizzle-orm';

import { UserDTO } from '@repo/dtos';
import { db, users } from '~/database';
import { sessionManager } from './session';
import { kindeAuthClient } from './client';

export type AuthedUser = UserDTO;

type Env = {
  Variables: {
    user: AuthedUser;
  };
};

export const getUser = createMiddleware<Env>(async (c, next) => {
  try {
    const manager = sessionManager(c);
    const isAuthenticated = await kindeAuthClient.isAuthenticated(manager);

    if (!isAuthenticated) return c.json({ error: 'Unauthorized' }, 401);

    const currentUser = await kindeAuthClient.getUserProfile(manager);

    const user = await db.query.users.findFirst({
      where: eq(users.kindeId, currentUser.id),
      columns: { createdAt: false, updatedAt: false, deletedAt: false },
    });

    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    c.set('user', { ...currentUser, ...user });

    return await next();
  } catch (e) {
    console.error(e);
    return c.json({ error: 'Unauthorized' }, 401);
  }
});
