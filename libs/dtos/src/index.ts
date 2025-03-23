import { z } from 'zod';

export const IngredientDTO = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  available: z.boolean(),
});
export type IngredientDTO = z.infer<typeof IngredientDTO>;
