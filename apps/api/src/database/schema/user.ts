import { pgTable, uuid, varchar, type AnyPgColumn } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm/relations';

import { entity } from '../entity';
import { imageBlobs } from './image';
import { barUsers } from './bar';

export const users = pgTable('users', {
  ...entity(),
  kindeId: varchar('kinde_id', { length: 256 }).unique().notNull(),
  email: varchar('email', { length: 256 }).notNull(),
  username: varchar('username', { length: 256 }).notNull(),
  profileImageId: uuid('profile_image_id').references((): AnyPgColumn => imageBlobs.id),
});

export const usersRelations = relations(users, ({ many, one }) => ({
  profileImage: one(imageBlobs, {
    fields: [users.profileImageId],
    references: [imageBlobs.id],
  }),
  bars: many(barUsers),
}));
