import {
  pgTable,
  text,
  uuid,
  varchar,
  real,
  primaryKey,
  boolean,
  integer,
  type AnyPgColumn,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm/relations';

import { entityTimestamps } from '../entity';
import { users } from './user';
import { ingredients } from './ingredient';
import { bars } from './bar';
import { imageBlobs } from './image';

export const cocktails = pgTable('cocktails', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 256 }).notNull(),
  description: text('description').notNull().default(''),
  ownerId: uuid('owner_id').references((): AnyPgColumn => users.id, { onDelete: 'cascade' }),
  barId: uuid('bar_id').references((): AnyPgColumn => bars.id, { onDelete: 'cascade' }),
  // FullEntity tracking
  createdBy: uuid('created_by').references((): AnyPgColumn => users.id),
  updatedBy: uuid('updated_by').references((): AnyPgColumn => users.id),
  deletedBy: uuid('deleted_by'),
  // images and tags
  iconImageId: uuid('icon_image_id').references((): AnyPgColumn => imageBlobs.id),
  cardImageId: uuid('card_image_id').references((): AnyPgColumn => imageBlobs.id),
  tags: text('tags').notNull().default('[]'),
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
    quantity: real('quantity').notNull(),
    index: integer('index').notNull().default(0),
    unit: varchar('unit', { length: 32 }).notNull().default('ml'),
    isOptional: boolean('is_optional').notNull().default(false),
    isGarnish: boolean('is_garnish').notNull().default(false),
  },
  (table) => [primaryKey({ columns: [table.cocktailId, table.ingredientId] })]
);

export const recipeItemRelations = relations(recipeItem, ({ one }) => ({
  cocktail: one(cocktails),
  ingredient: one(ingredients),
}));

export const recipeInstructions = pgTable('recipe_instructions', {
  cocktailId: uuid('cocktail_id')
    .notNull()
    .references(() => cocktails.id, { onDelete: 'cascade' }),
  index: integer('index').notNull().default(0),
  description: text('description').notNull().default(''),
  imageId: uuid('image_id').references(() => imageBlobs.id),
  ...entityTimestamps(),
});

export const recipeInstructionRelations = relations(recipeInstructions, ({ one }) => ({
  cocktail: one(cocktails, {
    fields: [recipeInstructions.cocktailId],
    references: [cocktails.id],
  }),
  image: one(imageBlobs, {
    fields: [recipeInstructions.imageId],
    references: [imageBlobs.id],
  }),
}));

export const cocktailRelations = relations(cocktails, ({ one, many }) => ({
  owner: one(users, {
    fields: [cocktails.ownerId],
    references: [users.id],
  }),
  bar: one(bars, {
    fields: [cocktails.barId],
    references: [bars.id],
  }),
  recipe: many(recipeItem),
  recipeInstructions: many(recipeInstructions),
  iconImage: one(imageBlobs, {
    fields: [cocktails.iconImageId],
    references: [imageBlobs.id],
  }),
  cardImage: one(imageBlobs, {
    fields: [cocktails.cardImageId],
    references: [imageBlobs.id],
  }),
}));
