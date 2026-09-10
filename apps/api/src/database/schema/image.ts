import { pgTable, uuid, varchar, type AnyPgColumn } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm/relations';

import { entityTimestamps } from '../entity';
import { users } from './user';

export const imageBlobs = pgTable('image_blobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  filename: varchar('filename', { length: 1024 }).notNull(),
  url: varchar('url', { length: 2048 }).notNull(),
  createdBy: uuid('created_by')
    .references((): AnyPgColumn => users.id)
    .notNull(),
  updatedBy: uuid('updated_by').references((): AnyPgColumn => users.id),
  deletedBy: uuid('deleted_by'),
  ...entityTimestamps(),
});

export const imageBlobRelations = relations(imageBlobs, ({ one }) => ({
  createdByUser: one(users, {
    fields: [imageBlobs.createdBy],
    references: [users.id],
  }),
}));
