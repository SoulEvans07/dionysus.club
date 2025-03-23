import { Hono } from 'hono';
import { eq } from 'drizzle-orm';

import { db, users } from '~/database';
import { sessionManager } from './session';
import { kindeAuthClient } from './client';
import { getUser } from './middleware';

export const kindeAuthController = new Hono();

kindeAuthController.get('/login', async (c) => {
  const loginUrl = await kindeAuthClient.login(sessionManager(c));
  return c.redirect(loginUrl.toString());
});

kindeAuthController.get('/register', async (c) => {
  const registerUrl = await kindeAuthClient.register(sessionManager(c));
  return c.redirect(registerUrl.toString());
});

kindeAuthController.get('/callback', async (c) => {
  // get called eveyr time we login or register
  const url = new URL(c.req.url);
  await kindeAuthClient.handleRedirectToApp(sessionManager(c), url);

  return c.redirect('/api/auth/post-login');
});

kindeAuthController.get('/post-login', async (c) => {
  const manager = sessionManager(c);

  const isAuthenticated = await kindeAuthClient.isAuthenticated(manager);

  if (isAuthenticated) {
    const user = await kindeAuthClient.getUserProfile(manager);

    const existing = await db.query.users.findFirst({
      where: eq(users.kindeId, user.id),
    });

    if (!existing) {
      // P3: redirect to first login page so user can set username and such
      await db.insert(users).values({
        kindeId: user.id,
        email: user.email,
        username: user.email.split('@')[0],
      });
    }
  } else {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  return c.redirect('/');
});

kindeAuthController.get('/logout', async (c) => {
  const logoutUrl = await kindeAuthClient.logout(sessionManager(c));
  return c.redirect(logoutUrl.toString());
});

kindeAuthController.get('/me', getUser, async (c) => {
  return c.json({ user: c.var.user });
});
