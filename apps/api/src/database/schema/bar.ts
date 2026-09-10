import { pgTable, uuid, varchar, text, type AnyPgColumn } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm/relations';

import { entityTimestamps } from '../entity';
import { users } from './user';
import { barUsers } from './barUserRelationship';
import { imageBlobs } from './image';

export const bars = pgTable('bars', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 256 }).notNull(),
  slogan: varchar('slogan', { length: 512 }).notNull().default(''),
  description: text('description').notNull().default(''),
  ownedBy: uuid('owned_by').references((): AnyPgColumn => users.id, { onDelete: 'cascade' }),
  logoImageId: uuid('logo_image_id').references((): AnyPgColumn => imageBlobs.id),
  bannerImageId: uuid('banner_image_id').references((): AnyPgColumn => imageBlobs.id),
  ...entityTimestamps(),
});

export const barRelations = relations(bars, ({ one, many }) => ({
  owner: one(users, {
    fields: [bars.ownedBy],
    references: [users.id],
  }),
  logoImage: one(imageBlobs, {
    fields: [bars.logoImageId],
    references: [imageBlobs.id],
  }),
  bannerImage: one(imageBlobs, {
    fields: [bars.bannerImageId],
    references: [imageBlobs.id],
  }),
  users: many(barUsers),
}));
