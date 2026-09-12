import { z } from 'zod';

export const UserDTO = z.object({
  id: z.string(),
  kindeId: z.string(),
  username: z.string(),
  email: z.string(),
  picture: z.string().nullable(),
  profileImageId: z.string().nullable(),
});
export type UserDTO = z.infer<typeof UserDTO>;
