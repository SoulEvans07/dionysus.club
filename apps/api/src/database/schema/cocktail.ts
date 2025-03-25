import { pgTable, text, uuid, varchar, real, primaryKey, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm/relations';

import { entityTimestamps } from '../entity';
import { users } from './user';
import { ingredients } from './ingredient';
import { foreignKey } from 'drizzle-orm/pg-core';

export const cocktails = pgTable('cocktails', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 256 }).notNull(),
  description: text('description').notNull().default(''),
  ownerId: uuid('owner_id').references(() => users.id, { onDelete: 'cascade' }),
  ...entityTimestamps(),
});

export const recipeItem = pgTable(
  'recipeItem',
  {
    cocktailId: uuid('cocktail_id')
      .notNull()
      .references(() => cocktails.id, { onDelete: 'cascade' }),
    ingredientId: uuid('ingredient_id')
      .notNull()
      .references(() => ingredients.id, { onDelete: 'cascade' }),
    amount: real('amount').notNull(),
    isOptional: boolean('is_optional').notNull().default(false),
    isGarnish: boolean('is_garnish').notNull().default(false),
  },
  (table) => [primaryKey({ columns: [table.cocktailId, table.ingredientId] })]
);

export const recipeItemRelations = relations(recipeItem, ({ one }) => ({
  cocktail: one(cocktails),
  ingredient: one(ingredients),
}));

export const cocktailRelations = relations(cocktails, ({ one, many }) => ({
  owner: one(users),
  recipe: many(recipeItem),
}));
