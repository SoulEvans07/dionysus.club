import { z } from 'zod';
import { ImageDTO } from './image';

export const UserDTO = z.object({
  id: z.string(),
  kindeId: z.string(),
  username: z.string(),
  email: z.string(),
  // picture: z.string().nullable(),
  profileImageId: z.string().nullable(),
});
export type UserDTO = z.infer<typeof UserDTO>;

export const MeDTO = UserDTO.extend({
  personalBarId: z.string(),
});
export type MeDTO = z.infer<typeof MeDTO>;

export const UserWithImageDTO = UserDTO.extend({
  profileImage: ImageDTO.nullable(),
});
export type UserWithImageDTO = z.infer<typeof UserWithImageDTO>;

// All another user may see of someone. Every user is public for now; private profiles come later.
export const PublicUserDTO = z.object({
  id: z.string(),
  username: z.string(),
  profileImage: ImageDTO.nullable(),
});
export type PublicUserDTO = z.infer<typeof PublicUserDTO>;

export const UserSearchQueryParams = z.object({
  q: z.string().trim().min(2, 'Type at least 2 characters').max(64),
});
export type UserSearchQueryParams = z.infer<typeof UserSearchQueryParams>;
