import { pgTable, text, uuid, varchar, boolean, pgEnum, primaryKey, type AnyPgColumn } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm/relations';

import { users } from './user';
import { bars } from './bar';
import { imageBlobs } from './image';
import { tags } from './tag';
import { fullEntity } from '../entity';

export const ingredients = pgTable('ingredients', {
  ...fullEntity(),
  barId: uuid('bar_id')
    .notNull()
    .references((): AnyPgColumn => bars.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 256 }).notNull(),
  description: text('description').notNull().default(''),
  available: boolean('available').notNull().default(false),
  units: text('units').notNull().default('[]'),
  iconImageId: uuid('icon_image_id').references((): AnyPgColumn => imageBlobs.id),
  cardImageId: uuid('card_image_id').references((): AnyPgColumn => imageBlobs.id),
});

export const ingredientTags = pgTable(
  'ingredient_tags',
  {
    ingredientId: uuid('ingredient_id')
      .notNull()
      .references((): AnyPgColumn => ingredients.id, { onDelete: 'cascade' }),
    tagId: uuid('tag_id')
      .notNull()
      .references((): AnyPgColumn => tags.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.ingredientId, t.tagId] })]
);

export const ingredientTagRelations = relations(ingredientTags, ({ one }) => ({
  ingredient: one(ingredients, { fields: [ingredientTags.ingredientId], references: [ingredients.id] }),
  tag: one(tags, { fields: [ingredientTags.tagId], references: [tags.id] }),
}));

export const ingredientRelations = relations(ingredients, ({ one, many }) => ({
  createdBy: one(users, { fields: [ingredients.createdById], references: [users.id] }),
  updatedBy: one(users, { fields: [ingredients.updatedById], references: [users.id] }),
  deletedBy: one(users, { fields: [ingredients.deletedById], references: [users.id] }),
  bar: one(bars, { fields: [ingredients.barId], references: [bars.id] }),
  iconImage: one(imageBlobs, { fields: [ingredients.iconImageId], references: [imageBlobs.id] }),
  cardImage: one(imageBlobs, { fields: [ingredients.cardImageId], references: [imageBlobs.id] }),
  tags: many(ingredientTags),
}));
