import { pgTable, uuid, varchar, type AnyPgColumn } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm/relations';

import { entityTimestamps } from '../entity';
import { ingredients } from './ingredient';
import { barUsers } from './barUserRelationship';
import { imageBlobs } from './image';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  kindeId: varchar('kinde_id', { length: 256 }).unique().notNull(),
  username: varchar('username', { length: 256 }).notNull(),
  email: varchar('email', { length: 256 }).notNull(),
  profileImageId: uuid('profile_image_id').references((): AnyPgColumn => imageBlobs.id),
  ...entityTimestamps(),
});

export const usersRelations = relations(users, ({ many, one }) => ({
  ingredients: many(ingredients),
  profileImage: one(imageBlobs, {
    fields: [users.profileImageId],
    references: [imageBlobs.id],
  }),
  bars: many(barUsers),
}));
