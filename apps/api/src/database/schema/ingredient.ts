import { pgTable, text, uuid, varchar, boolean, foreignKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm/relations';

import { users } from './user';
import { bars } from './bar';
import { imageBlobs } from './image';
import { entityTimestamps } from '../entity';

export const ingredients = pgTable('ingredients', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 256 }).notNull(),
  description: text('description').notNull().default(''),
  ownerId: uuid('owner_id').references(() => users.id, { onDelete: 'cascade' }),
  barId: uuid('bar_id').references(() => bars.id, { onDelete: 'cascade' }),
  // FullEntity tracking
  createdBy: uuid('created_by').references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
  deletedBy: uuid('deleted_by'),
  // images
  iconImageId: uuid('icon_image_id').references(() => imageBlobs.id),
  cardImageId: uuid('card_image_id').references(() => imageBlobs.id),
  // flexible arrays stored as JSON text
  units: text('units').notNull().default('[]'),
  tags: text('tags').notNull().default('[]'),
  available: boolean('available').notNull().default(false),
  ...entityTimestamps(),
});

export const ingredientRelations = relations(ingredients, ({ one }) => ({
  owner: one(users, {
    fields: [ingredients.ownerId],
    references: [users.id],
  }),
  bar: one(bars, {
    fields: [ingredients.barId],
    references: [bars.id],
  }),
  iconImage: one(imageBlobs, {
    fields: [ingredients.iconImageId],
    references: [imageBlobs.id],
  }),
  cardImage: one(imageBlobs, {
    fields: [ingredients.cardImageId],
    references: [imageBlobs.id],
  }),
  createdByUser: one(users, {
    fields: [ingredients.createdBy],
    references: [users.id],
  }),
  updatedByUser: one(users, {
    fields: [ingredients.updatedBy],
    references: [users.id],
  }),
}));
