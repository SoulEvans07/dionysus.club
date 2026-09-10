import { pgTable, uuid, varchar, timestamp, primaryKey, type AnyPgColumn } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm/relations';

import { cocktails } from './cocktail';
import { ingredients } from './ingredient';
import { users } from './user';

export const shareLinks = pgTable('share_links', {
  id: uuid('id').primaryKey().defaultRandom(),
  createdBy: uuid('created_by')
    .notNull()
    .references((): AnyPgColumn => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp('expires_at', { mode: 'date', withTimezone: true }).notNull(),
  type: varchar('type', { length: 32 }).notNull().default('copy'),
});

export const shareLinkCocktails = pgTable(
  'share_link_cocktails',
  {
    shareLinkId: uuid('share_link_id')
      .notNull()
      .references((): AnyPgColumn => shareLinks.id, { onDelete: 'cascade' }),
    cocktailId: uuid('cocktail_id')
      .notNull()
      .references((): AnyPgColumn => cocktails.id, { onDelete: 'cascade' }),
  },
  (table) => [primaryKey({ columns: [table.shareLinkId, table.cocktailId] })]
);

export const shareLinkIngredients = pgTable(
  'share_link_ingredients',
  {
    shareLinkId: uuid('share_link_id')
      .notNull()
      .references((): AnyPgColumn => shareLinks.id, { onDelete: 'cascade' }),
    ingredientId: uuid('ingredient_id')
      .notNull()
      .references((): AnyPgColumn => ingredients.id, { onDelete: 'cascade' }),
  },
  (table) => [primaryKey({ columns: [table.shareLinkId, table.ingredientId] })]
);

export const shareLinkRelations = relations(shareLinks, ({ one, many }) => ({
  creator: one(users, {
    fields: [shareLinks.createdBy],
    references: [users.id],
  }),
  cocktails: many(shareLinkCocktails),
  ingredients: many(shareLinkIngredients),
}));

// export const shareLinkCocktailRelations = relations(shareLinkCocktails, ({ one }) => ({
//   shareLink: one(shareLinks, {
//     fields: [shareLinkCocktails.shareLinkId],
//     references: [shareLinks.id],
//   }),
//   cocktail: one(cocktails, {
//     fields: [shareLinkCocktails.cocktailId],
//     references: [cocktails.id],
//   }),
// }));

// export const shareLinkIngredientRelations = relations(shareLinkIngredients, ({ one }) => ({
//   shareLink: one(shareLinks, {
//     fields: [shareLinkIngredients.shareLinkId],
//     references: [shareLinks.id],
//   }),
//   ingredient: one(ingredients, {
//     fields: [shareLinkIngredients.ingredientId],
//     references: [ingredients.id],
//   }),
// }));
