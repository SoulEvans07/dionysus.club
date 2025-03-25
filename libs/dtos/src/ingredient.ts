import { z } from 'zod';

export const IngredientDTO = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  available: z.boolean(),
});
export type IngredientDTO = z.infer<typeof IngredientDTO>;

export const CreateIngredientDTO = IngredientDTO.omit({ id: true });
export type CreateIngredientDTO = z.infer<typeof CreateIngredientDTO>;

export const UpdateIngredientDTO = IngredientDTO.pick({ id: true }).merge(IngredientDTO.omit({ id: true }).partial());
export type UpdateIngredientDTO = z.infer<typeof UpdateIngredientDTO>;
