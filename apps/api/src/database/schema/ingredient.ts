import { pgTable, text, uuid, varchar, boolean, foreignKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm/relations';

import { users } from './user';
import { entityTimestamps } from '../entity';

export const ingredients = pgTable('ingredients', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 256 }).notNull(),
  description: text('description').notNull().default(''),
  ownerId: uuid('owner_id').references(() => users.id, { onDelete: 'cascade' }),
  available: boolean('available').notNull().default(false),
  ...entityTimestamps(),
});

export const ingredientRelations = relations(ingredients, ({ one }) => ({
  owner: one(users, {
    fields: [ingredients.ownerId],
    references: [users.id],
  }),
}));
