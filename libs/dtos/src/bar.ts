import { z } from 'zod';

export const BarType = z.enum(['public', 'private', 'personal']);
export type BarType = z.infer<typeof BarType>;

export const BarRole = z.enum(['admin', 'bartender', 'guest']);
export type BarRole = z.infer<typeof BarRole>;

export const BarDTO = z.object({
  id: z.string(),
  ownedBy: z.string(),
  name: z.string(),
  slogan: z.string(),
  description: z.string(),
  barType: BarType,
  logoImageId: z.string().nullable(),
  bannerImageId: z.string().nullable(),
});
export type BarDTO = z.infer<typeof BarDTO>;

export const CreateBarDTO = BarDTO.omit({ id: true, ownedBy: true, barType: true }).extend({
  barType: BarType.exclude(['personal']),
});
export type CreateBarDTO = z.infer<typeof CreateBarDTO>;

export const UpdateBarDTO = BarDTO.omit({ id: true, ownedBy: true, barType: true }).partial();
export type UpdateBarDTO = z.infer<typeof UpdateBarDTO>;

export const BarMemberDTO = z.object({
  userId: z.string(),
  role: BarRole,
});
export type BarMemberDTO = z.infer<typeof BarMemberDTO>;

export const AddBarMemberDTO = BarMemberDTO;
export type AddBarMemberDTO = z.infer<typeof AddBarMemberDTO>;

export const UpdateBarMemberDTO = BarMemberDTO.pick({ role: true });
export type UpdateBarMemberDTO = z.infer<typeof UpdateBarMemberDTO>;
