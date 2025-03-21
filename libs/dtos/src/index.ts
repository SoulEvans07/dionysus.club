import { z } from 'zod';

export const Ingredient = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  available: z.boolean(),
});
export type Ingredient = z.infer<typeof Ingredient>;
