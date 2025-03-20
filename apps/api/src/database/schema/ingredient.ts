import { pgTable, text, uuid, varchar, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm/relations';

import { users } from './user';
import { entityTimestamps } from '../entity';

export const ingredients = pgTable('ingredient', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 256 }).notNull(),
  description: text('description').notNull().default(''),
  owner: uuid('owner').references(() => users.id, { onDelete: 'cascade' }),
  available: boolean('available').notNull().default(false),
  ...entityTimestamps(),
});
