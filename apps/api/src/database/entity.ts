import { timestamp } from 'drizzle-orm/pg-core';

// NOTE: https://github.com/drizzle-team/drizzle-orm/pull/1509
// Based on https://github.com/drizzle-team/drizzle-orm/issues/956#issuecomment-1732327425
export function entityTimestamps() {
  return {
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { mode: 'date', withTimezone: true }),
  };
}
