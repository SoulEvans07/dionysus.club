import { z } from 'zod';

export const DynamicIcon = z.enum(['crown', 'usersRound']);
export type DynamicIcon = z.infer<typeof DynamicIcon>;
