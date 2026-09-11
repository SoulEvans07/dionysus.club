import { uuid, timestamp, type AnyPgColumn } from 'drizzle-orm/pg-core';
import { users } from './schema';

export function identifiable() {
  return {
    id: uuid('id').primaryKey().defaultRandom(),
  }
}

// NOTE: https://github.com/drizzle-team/drizzle-orm/pull/1509
// Based on https://github.com/drizzle-team/drizzle-orm/issues/956#issuecomment-1732327425
export function entity() {
  return {
    ...identifiable(),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { mode: 'date', withTimezone: true }),
  };
}

export function fullEntity() {
  return {
    ...entity(),
    createdById: uuid('created_by')
      .references((): AnyPgColumn => users.id)
      .notNull(),
    updatedById: uuid('updated_by')
      .references((): AnyPgColumn => users.id)
      .notNull(),
    deletedById: uuid('deleted_by').references((): AnyPgColumn => users.id),
  };
}
