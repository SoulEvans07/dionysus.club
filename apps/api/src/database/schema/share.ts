import { pgTable, uuid, varchar, timestamp, primaryKey, pgEnum, type AnyPgColumn } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm/relations';

import { identifiable } from '../entity';
import { cocktails } from './cocktail';
import { ingredients } from './ingredient';
import { users } from './user';

export const shareLinkTypeEnum = pgEnum('share_link_type', ['copy']);

export const shareLinks = pgTable('share_links', {
  ...identifiable(),
  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by')
    .notNull()
    .references((): AnyPgColumn => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at', { mode: 'date', withTimezone: true }).notNull(),
  type: shareLinkTypeEnum().notNull().default('copy'),
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
  (t) => [primaryKey({ columns: [t.shareLinkId, t.cocktailId] })]
);

export const shareLinkCocktailRelations = relations(shareLinkCocktails, ({ one }) => ({
  shareLink: one(shareLinks, { fields: [shareLinkCocktails.shareLinkId], references: [shareLinks.id] }),
  cocktail: one(cocktails, { fields: [shareLinkCocktails.cocktailId], references: [cocktails.id] }),
}));

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
  (t) => [primaryKey({ columns: [t.shareLinkId, t.ingredientId] })]
);

export const shareLinkIngredientRelations = relations(shareLinkIngredients, ({ one }) => ({
  shareLink: one(shareLinks, { fields: [shareLinkIngredients.shareLinkId], references: [shareLinks.id] }),
  ingredient: one(ingredients, { fields: [shareLinkIngredients.ingredientId], references: [ingredients.id] }),
}));

export const shareLinkRelations = relations(shareLinks, ({ one, many }) => ({
  createdBy: one(users, { fields: [shareLinks.createdBy], references: [users.id] }),
  cocktails: many(shareLinkCocktails),
  ingredients: many(shareLinkIngredients),
}));
