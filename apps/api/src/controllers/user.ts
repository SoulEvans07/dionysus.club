import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { and, ilike, isNull, ne, sql } from 'drizzle-orm';
import { PublicUserDTO, SYSTEM_USER_ID, UserSearchQueryParams } from '@repo/dtos';
import { db, users } from '~/database';
import { getUser } from '~/auth/kinde';
import { publicUserQuery } from '~/utils/user';

export const userController = new Hono();

const SEARCH_LIMIT = 20;

// Every user is searchable for now; once profiles can be private this is where they get filtered out.
userController.get('/search', getUser, zValidator('query', UserSearchQueryParams), async (c) => {
  const { q } = c.req.valid('query');
  const needle = q.toLowerCase();
  const pattern = `%${needle.replace(/[\\%_]/g, '\\$&')}%`; // `%` and `_` are LIKE wildcards

  const list = await db.query.users.findMany({
    ...publicUserQuery,
    where: and(ilike(users.username, pattern), isNull(users.deletedAt), ne(users.id, SYSTEM_USER_ID)),
    // Earlier matches first, so "ann" ranks "anna" above "joanna".
    orderBy: [sql`position(${needle} in lower(${users.username}))`, users.username],
    limit: SEARCH_LIMIT,
  });

  return c.json<PublicUserDTO[]>(list);
});
