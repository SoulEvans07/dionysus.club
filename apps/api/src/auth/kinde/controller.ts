import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';

import { bars, db, users } from '~/database';
import { sessionManager } from './session';
import { kindeAuthClient } from './client';
import { getUser } from './middleware';

export const kindeAuthController = new Hono();

const POST_LOGIN_REDIRECT_COOKIE = 'post_login_redirect';

// Only allow same-app relative paths, so this can't be abused as an open redirect.
function isSafeRedirectPath(path: string | null | undefined): path is string {
  if (!path) return false;
  if (!path.startsWith('/')) return false;
  if (path.startsWith('//')) return false;
  if (path.startsWith('/\\')) return false;
  if (path.includes('://')) return false;
  return true;
}

kindeAuthController.get('/login', async (c) => {
  const redirect = c.req.query('redirect');

  if (isSafeRedirectPath(redirect)) {
    setCookie(c, POST_LOGIN_REDIRECT_COOKIE, redirect, {
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
      maxAge: 300,
    });
  } else {
    deleteCookie(c, POST_LOGIN_REDIRECT_COOKIE);
  }

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
      await db.transaction(async (tx) => {
        const [created] = await tx
          .insert(users)
          .values({
            kindeId: user.id,
            email: user.email,
            username: user.email.split('@')[0],
          })
          .returning();

        await tx.insert(bars).values({
          ownedBy: created.id,
          name: `${created.username}'s Bar`,
          barType: 'personal',
          createdById: created.id,
          updatedById: created.id,
        });
      });
    }
  } else {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const redirect = getCookie(c, POST_LOGIN_REDIRECT_COOKIE);
  deleteCookie(c, POST_LOGIN_REDIRECT_COOKIE);

  return c.redirect(isSafeRedirectPath(redirect) ? redirect : '/');
});

kindeAuthController.get('/logout', async (c) => {
  const logoutUrl = await kindeAuthClient.logout(sessionManager(c));
  return c.redirect(logoutUrl.toString());
});

kindeAuthController.get('/me', getUser, async (c) => {
  return c.json({ user: c.var.user });
});
