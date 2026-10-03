import { z } from 'zod';
import { ImageDTO } from './image';
import { TwBaseColor } from './colors';
import { DynamicIcon } from './icons';
import { PublicUserDTO } from './user';

export const BarType = z.enum(['public', 'private', 'personal', 'system']);
export type BarType = z.infer<typeof BarType>;

export const BarRoleDAL = z.enum(['admin', 'bartender', 'member', 'guest']);
export type BarRoleDAL = z.infer<typeof BarRoleDAL>;
export const BarRole = z.enum(['owner', 'admin', 'bartender', 'member', 'guest']);
export type BarRole = z.infer<typeof BarRole>;

// Whether `actor` may add, remove or assign someone with `role`. The owner manages everyone,
// admins manage the roles below admin, and nobody manages the owner (ownership isn't transferable here).
export function canManageBarRole(actor: BarRole | null | undefined, role: BarRole): boolean {
  if (role === 'owner') return false;
  if (actor === 'owner') return true;
  if (actor === 'admin') return role !== 'admin';
  return false;
}

export const BarDTO = z.object({
  id: z.string(),
  ownedBy: z.string(),
  name: z.string(),
  slogan: z.string(),
  description: z.string(),
  barType: BarType,
  logoImageId: z.string().nullable(),
  logoImage: ImageDTO.nullable(),
  bannerImageId: z.string().nullable(),
  bannerImage: ImageDTO.nullable(),
});
export type BarDTO = z.infer<typeof BarDTO>;

export const BarWithRoleDTO = BarDTO.extend({
  role: BarRole,
});
export type BarWithRoleDTO = z.infer<typeof BarWithRoleDTO>;

export const CreateBarDTO = BarDTO.omit({ id: true, ownedBy: true, barType: true }).extend({
  barType: BarType.exclude(['personal', 'system']),
});
export type CreateBarDTO = z.infer<typeof CreateBarDTO>;

export const UpdateBarDTO = BarDTO.omit({ id: true, ownedBy: true, barType: true }).partial();
export type UpdateBarDTO = z.infer<typeof UpdateBarDTO>;

export const BarMemberDTO = z.object({
  userId: z.string(),
  role: BarRole,
});
export type BarMemberDTO = z.infer<typeof BarMemberDTO>;

export const GetBarMemberDTO = BarMemberDTO.extend({
  barId: z.string(),
  user: PublicUserDTO,
});
export type GetBarMemberDTO = z.infer<typeof GetBarMemberDTO>;

// Members are invited by email, since that's what people actually know about each other.
export const AddBarMemberDTO = z.object({
  email: z.string().trim().pipe(z.email('Enter a valid email')),
  role: BarRoleDAL,
});
export type AddBarMemberDTO = z.infer<typeof AddBarMemberDTO>;

export const UpdateBarMemberDTO = AddBarMemberDTO.pick({ role: true });
export type UpdateBarMemberDTO = z.infer<typeof UpdateBarMemberDTO>;

export const SidebarBarGroup = z.object({
  index: z.number(),
  id: z.string(),
  name: z.string(),
  bars: BarDTO.array(),
  color: TwBaseColor,
  icon: DynamicIcon,
});
export type SidebarBarGroup = z.infer<typeof SidebarBarGroup>;

export const SidebarDTO = z.object({
  personal: BarDTO,
  groups: SidebarBarGroup.array(),
});
export type SidebarDTO = z.infer<typeof SidebarDTO>;
