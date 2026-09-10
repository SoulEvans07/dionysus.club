import { pgTable, uuid, varchar, text, integer, primaryKey, type AnyPgColumn } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm/relations';

import { entityTimestamps } from '../entity';
import { bars } from './bar';
import { cocktails } from './cocktail';
import { users } from './user';

export const menus = pgTable('menus', {
  id: uuid('id').primaryKey().defaultRandom(),
  barId: uuid('bar_id')
    .notNull()
    .references((): AnyPgColumn => bars.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 256 }).notNull(),
  subtitle: varchar('subtitle', { length: 512 }).notNull().default(''),
  createdBy: uuid('created_by').references((): AnyPgColumn => users.id),
  updatedBy: uuid('updated_by').references((): AnyPgColumn => users.id),
  deletedBy: uuid('deleted_by'),
  ...entityTimestamps(),
});

export const menuGroups = pgTable('menu_groups', {
  id: uuid('id').primaryKey().defaultRandom(),
  menuId: uuid('menu_id')
    .notNull()
    .references((): AnyPgColumn => menus.id, { onDelete: 'cascade' }),
  index: integer('index').notNull().default(0),
  title: varchar('title', { length: 256 }).notNull(),
  description: text('description').notNull().default(''),
});

export const menuItems = pgTable(
  'menu_items',
  {
    menuId: uuid('menu_id')
      .notNull()
      .references((): AnyPgColumn => menus.id, { onDelete: 'cascade' }),
    cocktailId: uuid('cocktail_id')
      .notNull()
      .references((): AnyPgColumn => cocktails.id, { onDelete: 'cascade' }),
    menuGroupId: uuid('menu_group_id').references((): AnyPgColumn => menuGroups.id, {
      onDelete: 'cascade',
    }),
  },
  (table) => [primaryKey({ columns: [table.menuId, table.cocktailId] })]
);

export const menuRelations = relations(menus, ({ one, many }) => ({
  bar: one(bars, {
    fields: [menus.barId],
    references: [bars.id],
  }),
  createdByUser: one(users, {
    fields: [menus.createdBy],
    references: [users.id],
  }),
  updatedByUser: one(users, {
    fields: [menus.updatedBy],
    references: [users.id],
  }),
  groups: many(menuGroups),
  items: many(menuItems),
}));

export const menuGroupRelations = relations(menuGroups, ({ one, many }) => ({
  menu: one(menus, {
    fields: [menuGroups.menuId],
    references: [menus.id],
  }),
  items: many(menuItems),
}));

export const menuItemRelations = relations(menuItems, ({ one }) => ({
  menu: one(menus, {
    fields: [menuItems.menuId],
    references: [menus.id],
  }),
  cocktail: one(cocktails, {
    fields: [menuItems.cocktailId],
    references: [cocktails.id],
  }),
  group: one(menuGroups, {
    fields: [menuItems.menuGroupId],
    references: [menuGroups.id],
  }),
}));
