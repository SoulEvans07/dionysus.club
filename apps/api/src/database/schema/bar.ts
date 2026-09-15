import { pgTable, uuid, varchar, text, primaryKey, pgEnum, type AnyPgColumn } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm/relations';

import { fullEntity } from '../entity';
import { users } from './user';
import { imageBlobs } from './image';

export const barTypeEnum = pgEnum('bar_type', ['public', 'private', 'personal', 'system']);

export const bars = pgTable('bars', {
  ...fullEntity(),
  ownedBy: uuid('owned_by')
    .notNull()
    .references((): AnyPgColumn => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 256 }).notNull(),
  slogan: varchar('slogan', { length: 512 }).notNull().default(''),
  description: text('description').notNull().default(''),
  logoImageId: uuid('logo_image_id').references((): AnyPgColumn => imageBlobs.id),
  bannerImageId: uuid('banner_image_id').references((): AnyPgColumn => imageBlobs.id),
  barType: barTypeEnum().notNull(), // TODO: change to type
});

export const barRoleEnum = pgEnum('bar_role', ['admin', 'bartender', 'member', 'guest']);

export const barUsers = pgTable(
  'bar_users',
  {
    barId: uuid('bar_id')
      .notNull()
      .references((): AnyPgColumn => bars.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references((): AnyPgColumn => users.id, { onDelete: 'cascade' }),
    role: barRoleEnum().notNull(),
  },
  (t) => [primaryKey({ columns: [t.barId, t.userId] })]
);

export const barUserRelationshipRelations = relations(barUsers, ({ one }) => ({
  bar: one(bars, { fields: [barUsers.barId], references: [bars.id] }),
  user: one(users, { fields: [barUsers.userId], references: [users.id] }),
}));

export const barRelations = relations(bars, ({ one, many }) => ({
  createdBy: one(users, { fields: [bars.createdById], references: [users.id] }),
  updatedBy: one(users, { fields: [bars.updatedById], references: [users.id] }),
  deletedBy: one(users, { fields: [bars.deletedById], references: [users.id] }),
  owner: one(users, { fields: [bars.ownedBy], references: [users.id] }),
  logoImage: one(imageBlobs, { fields: [bars.logoImageId], references: [imageBlobs.id] }),
  bannerImage: one(imageBlobs, { fields: [bars.bannerImageId], references: [imageBlobs.id] }),
  users: many(barUsers),
}));
