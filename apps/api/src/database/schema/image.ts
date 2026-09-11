import { pgTable, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm/relations';

import { fullEntity } from '../entity';
import { users } from './user';

export const imageBlobs = pgTable('image_blobs', {
  ...fullEntity(),
  filename: varchar('filename', { length: 64 }).notNull(),
  url: varchar('url', { length: 256 }).notNull(),
});

export const imageBlobRelations = relations(imageBlobs, ({ one }) => ({
  createdBy: one(users, { fields: [imageBlobs.createdById], references: [users.id] }),
  updatedBy: one(users, { fields: [imageBlobs.updatedById], references: [users.id] }),
  deletedBy: one(users, { fields: [imageBlobs.deletedById], references: [users.id] }),
}));
