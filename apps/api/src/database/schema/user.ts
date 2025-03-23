import { pgTable, uuid, varchar, type AnyPgColumn } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm/relations';

import { entityTimestamps } from '../entity';
import { ingredients } from './ingredient';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  kindeId: varchar('kinde_id', { length: 256 }).unique().notNull(),
  username: varchar('username', { length: 256 }).notNull(),
  email: varchar('email', { length: 256 }).notNull(),
  ...entityTimestamps(),
});

export const usersRelations = relations(users, ({ many }) => ({
  ingredients: many(ingredients),
}));
