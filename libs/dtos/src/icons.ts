import { z } from 'zod';

export const DynamicIcon = z.enum(['crown', 'users']);
export type DynamicIcon = z.infer<typeof DynamicIcon>;
