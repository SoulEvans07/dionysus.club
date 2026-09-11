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

import { fullEntity } from '../entity';
import { users } from './user';
import { ingredients } from './ingredient';
import { bars } from './bar';
import { imageBlobs } from './image';

export const cocktails = pgTable('cocktails', {
  ...fullEntity(),
  barId: uuid('bar_id')
    .notNull()
    .references((): AnyPgColumn => bars.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 256 }).notNull(),
  description: text('description').notNull().default(''),
  tags: text('tags').notNull().default('[]'),
  iconImageId: uuid('icon_image_id').references((): AnyPgColumn => imageBlobs.id),
  cardImageId: uuid('card_image_id').references((): AnyPgColumn => imageBlobs.id),
});

export const recipeItem = pgTable(
  'recipeItem',
  {
    cocktailId: uuid('cocktail_id')
      .notNull()
      .references((): AnyPgColumn => cocktails.id, { onDelete: 'cascade' }),
    ingredientId: uuid('ingredient_id')
      .notNull()
      .references((): AnyPgColumn => ingredients.id, { onDelete: 'cascade' }),
    index: integer('index').notNull().default(0),
    unit: varchar('unit', { length: 32 }).notNull(),
    quantity: real('quantity').notNull(),
    isOptional: boolean('is_optional').notNull().default(false),
    isGarnish: boolean('is_garnish').notNull().default(false),
  },
  (t) => [primaryKey({ columns: [t.cocktailId, t.ingredientId] })]
);

export const recipeItemRelations = relations(recipeItem, ({ one }) => ({
  cocktail: one(cocktails, { fields: [recipeItem.cocktailId], references: [cocktails.id] }),
  ingredient: one(ingredients, { fields: [recipeItem.ingredientId], references: [ingredients.id] }),
}));

export const recipeSteps = pgTable(
  'recipe_steps',
  {
    cocktailId: uuid('cocktail_id')
      .notNull()
      .references((): AnyPgColumn => cocktails.id, { onDelete: 'cascade' }),
    index: integer('index').notNull().default(0),
    description: text('description').notNull().default(''),
    imageId: uuid('image_id').references((): AnyPgColumn => imageBlobs.id),
  },
  (t) => [primaryKey({ columns: [t.cocktailId, t.index] })]
);

export const recipeStepRelations = relations(recipeSteps, ({ one }) => ({
  cocktail: one(cocktails, { fields: [recipeSteps.cocktailId], references: [cocktails.id] }),
  image: one(imageBlobs, { fields: [recipeSteps.imageId], references: [imageBlobs.id] }),
}));

export const cocktailRelations = relations(cocktails, ({ one, many }) => ({
  createdBy: one(users, { fields: [cocktails.createdById], references: [users.id] }),
  updatedBy: one(users, { fields: [cocktails.updatedById], references: [users.id] }),
  deletedBy: one(users, { fields: [cocktails.deletedById], references: [users.id] }),
  bar: one(bars, { fields: [cocktails.barId], references: [bars.id] }),
  ingredients: many(recipeItem),
  steps: many(recipeSteps),
  iconImage: one(imageBlobs, { fields: [cocktails.iconImageId], references: [imageBlobs.id] }),
  cardImage: one(imageBlobs, { fields: [cocktails.cardImageId], references: [imageBlobs.id] }),
}));
