import { pgTable, uuid, varchar, primaryKey, type AnyPgColumn } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm/relations';

import { users } from './user';
import { bars } from './bar';

export const barUsers = pgTable(
  'bar_users',
  {
    barId: uuid('bar_id')
      .notNull()
      .references((): AnyPgColumn => bars.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references((): AnyPgColumn => users.id, { onDelete: 'cascade' }),
    role: varchar('role', { length: 32 }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.barId, table.userId] })]
);

export const barUserRelationshipRelations = relations(barUsers, ({ one }) => ({
  bar: one(bars, {
    fields: [barUsers.barId],
    references: [bars.id],
  }),
  user: one(users, {
    fields: [barUsers.userId],
    references: [users.id],
  }),
}));
