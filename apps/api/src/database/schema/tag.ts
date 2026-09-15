import { pgTable, varchar, uuid, pgEnum, uniqueIndex, type AnyPgColumn } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm/relations';
import { isNull } from 'drizzle-orm';

import { fullEntity } from '../entity';
import { users } from './user';
import { bars } from './bar';

export const tagTypeEnum = pgEnum('tag_type', ['cocktail', 'ingredient', 'both']);

export const tags = pgTable(
  'tags',
  {
    ...fullEntity(),
    barId: uuid('bar_id')
      .notNull()
      .references((): AnyPgColumn => bars.id, { onDelete: 'cascade' }),
    type: tagTypeEnum().notNull(),
    namespace: varchar('namespace', { length: 64 }).notNull(),
    key: varchar('key', { length: 64 }).notNull(),
    name: varchar('name', { length: 256 }).notNull(),
    color: varchar('color', { length: 32 }).notNull(),
  },
  (t) => [
    uniqueIndex('tags_bar_type_namespace_key_unique')
      .on(t.barId, t.type, t.namespace, t.key)
      .where(isNull(t.deletedAt)),
  ]
);

export const tagRelations = relations(tags, ({ one }) => ({
  createdBy: one(users, { fields: [tags.createdById], references: [users.id] }),
  updatedBy: one(users, { fields: [tags.updatedById], references: [users.id] }),
  deletedBy: one(users, { fields: [tags.deletedById], references: [users.id] }),
  bar: one(bars, { fields: [tags.barId], references: [bars.id] }),
}));
