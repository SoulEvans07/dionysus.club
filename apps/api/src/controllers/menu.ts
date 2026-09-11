import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { and, eq, isNull } from 'drizzle-orm';

import {
  AddMenuItemDTO,
  CreateMenuDTO,
  CreateMenuGroupDTO,
  MenuDetailDTO,
  MenuDTO,
  UpdateMenuDTO,
  UpdateMenuGroupDTO,
} from '@repo/dtos';
import { db, menuGroups, menuItems, menus } from '~/database';
import { getUser } from '~/auth/kinde';
import { getBar } from '~/middleware/bar';

export const menuController = new Hono();

menuController.get('/list', getUser, getBar, async (c) => {
  const bar = c.var.bar;

  const list = await db.query.menus.findMany({
    where: and(eq(menus.barId, bar.id), isNull(menus.deletedAt)),
  });

  return c.json<MenuDTO[]>(MenuDTO.array().parse(list));
});

menuController.get('/:id', getUser, getBar, async (c) => {
  const bar = c.var.bar;
  const id = c.req.param('id');

  const item = await db.query.menus.findFirst({
    where: and(eq(menus.id, id), eq(menus.barId, bar.id), isNull(menus.deletedAt)),
    with: { groups: true, directItems: true },
  });

  if (!item) return c.json({ error: 'Not found' }, 404);

  const { directItems: items, ...menu } = item;
  return c.json<MenuDetailDTO>(MenuDetailDTO.parse({ ...menu, items }));
});

menuController.post('/create', getUser, getBar, zValidator('json', CreateMenuDTO), async (c) => {
  const user = c.var.user;
  const bar = c.var.bar;
  const body = c.req.valid('json');

  const [item] = await db
    .insert(menus)
    .values({ ...body, barId: bar.id, createdById: user.id, updatedById: user.id })
    .returning();

  return c.json<MenuDTO>(MenuDTO.parse(item));
});

menuController.put('/:id', getUser, getBar, zValidator('json', UpdateMenuDTO), async (c) => {
  const user = c.var.user;
  const bar = c.var.bar;
  const id = c.req.param('id');
  const body = c.req.valid('json');

  const menu = await db.query.menus.findFirst({
    where: and(eq(menus.id, id), eq(menus.barId, bar.id), isNull(menus.deletedAt)),
  });

  if (!menu) return c.json({ error: 'Not found' }, 404);

  await db
    .update(menus)
    .set({ ...body, updatedById: user.id })
    .where(eq(menus.id, id));

  return c.json({ id });
});

menuController.delete('/:id', getUser, getBar, async (c) => {
  const user = c.var.user;
  const bar = c.var.bar;
  const id = c.req.param('id');

  const menu = await db.query.menus.findFirst({
    where: and(eq(menus.id, id), eq(menus.barId, bar.id), isNull(menus.deletedAt)),
  });

  if (!menu) return c.json({ error: 'Not found' }, 404);

  await db.update(menus).set({ deletedAt: new Date(), deletedById: user.id }).where(eq(menus.id, id));

  return c.json({ success: true });
});

menuController.post(
  '/:menuId/groups',
  getUser,
  getBar,
  zValidator('json', CreateMenuGroupDTO),
  async (c) => {
    const bar = c.var.bar;
    const menuId = c.req.param('menuId');
    const body = c.req.valid('json');

    const menu = await db.query.menus.findFirst({
      where: and(eq(menus.id, menuId), eq(menus.barId, bar.id), isNull(menus.deletedAt)),
    });

    if (!menu) return c.json({ error: 'Not found' }, 404);

    const [group] = await db
      .insert(menuGroups)
      .values({ ...body, menuId: menu.id })
      .returning();

    return c.json(group);
  }
);

menuController.put(
  '/:menuId/groups/:groupId',
  getUser,
  getBar,
  zValidator('json', UpdateMenuGroupDTO),
  async (c) => {
    const bar = c.var.bar;
    const menuId = c.req.param('menuId');
    const groupId = c.req.param('groupId');
    const body = c.req.valid('json');

    const group = await db.query.menuGroups.findFirst({
      where: and(eq(menuGroups.id, groupId), eq(menuGroups.menuId, menuId)),
      with: { menu: true },
    });

    if (!group || group.menu.barId !== bar.id) return c.json({ error: 'Not found' }, 404);

    await db.update(menuGroups).set(body).where(eq(menuGroups.id, groupId));

    return c.json({ id: groupId });
  }
);

menuController.delete('/:menuId/groups/:groupId', getUser, getBar, async (c) => {
  const bar = c.var.bar;
  const menuId = c.req.param('menuId');
  const groupId = c.req.param('groupId');

  const group = await db.query.menuGroups.findFirst({
    where: and(eq(menuGroups.id, groupId), eq(menuGroups.menuId, menuId)),
    with: { menu: true },
  });

  if (!group || group.menu.barId !== bar.id) return c.json({ error: 'Not found' }, 404);

  await db.delete(menuGroups).where(eq(menuGroups.id, groupId));

  return c.json({ success: true });
});

menuController.post('/:menuId/items', getUser, getBar, zValidator('json', AddMenuItemDTO), async (c) => {
  const bar = c.var.bar;
  const menuId = c.req.param('menuId');
  const body = c.req.valid('json');

  const menu = await db.query.menus.findFirst({
    where: and(eq(menus.id, menuId), eq(menus.barId, bar.id), isNull(menus.deletedAt)),
  });

  if (!menu) return c.json({ error: 'Not found' }, 404);

  const [item] = await db
    .insert(menuItems)
    .values({ ...body, menuId: menu.id })
    .onConflictDoUpdate({
      target: [menuItems.menuId, menuItems.cocktailId],
      set: { menuGroupId: body.menuGroupId, index: body.index },
    })
    .returning();

  return c.json(item);
});

menuController.delete('/:menuId/items/:cocktailId', getUser, getBar, async (c) => {
  const bar = c.var.bar;
  const menuId = c.req.param('menuId');
  const cocktailId = c.req.param('cocktailId');

  const menu = await db.query.menus.findFirst({
    where: and(eq(menus.id, menuId), eq(menus.barId, bar.id), isNull(menus.deletedAt)),
  });

  if (!menu) return c.json({ error: 'Not found' }, 404);

  await db
    .delete(menuItems)
    .where(and(eq(menuItems.menuId, menuId), eq(menuItems.cocktailId, cocktailId)));

  return c.json({ success: true });
});
