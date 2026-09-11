import { z } from 'zod';

export const MenuDTO = z.object({
  id: z.string(),
  barId: z.string(),
  title: z.string(),
  subtitle: z.string(),
  filter: z.string(),
  defaultSortBy: z.string(),
});
export type MenuDTO = z.infer<typeof MenuDTO>;

export const CreateMenuDTO = MenuDTO.omit({ id: true, barId: true });
export type CreateMenuDTO = z.infer<typeof CreateMenuDTO>;

export const UpdateMenuDTO = MenuDTO.omit({ id: true, barId: true }).partial();
export type UpdateMenuDTO = z.infer<typeof UpdateMenuDTO>;

export const MenuGroupDTO = z.object({
  id: z.string(),
  menuId: z.string(),
  index: z.number(),
  title: z.string(),
  description: z.string(),
  filter: z.string(),
  defaultSortBy: z.string(),
});
export type MenuGroupDTO = z.infer<typeof MenuGroupDTO>;

export const CreateMenuGroupDTO = MenuGroupDTO.omit({ id: true, menuId: true });
export type CreateMenuGroupDTO = z.infer<typeof CreateMenuGroupDTO>;

export const UpdateMenuGroupDTO = MenuGroupDTO.omit({ id: true, menuId: true }).partial();
export type UpdateMenuGroupDTO = z.infer<typeof UpdateMenuGroupDTO>;

export const MenuItemDTO = z.object({
  cocktailId: z.string(),
  menuGroupId: z.string().nullable(),
  index: z.number(),
});
export type MenuItemDTO = z.infer<typeof MenuItemDTO>;

export const AddMenuItemDTO = MenuItemDTO.omit({ index: true }).extend({
  menuGroupId: z.string().nullable().optional(),
  index: z.number().optional(),
});
export type AddMenuItemDTO = z.infer<typeof AddMenuItemDTO>;

export const MenuDetailDTO = MenuDTO.extend({
  groups: MenuGroupDTO.array(),
  items: MenuItemDTO.array(),
});
export type MenuDetailDTO = z.infer<typeof MenuDetailDTO>;
