import { z } from 'zod';
import { TagDTO } from './tag';
import { ImageDTO } from './image';

export const IngredientDTO = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  available: z.boolean(),
  tags: TagDTO.array(),
  iconImage: ImageDTO.nullable(),
  cardImage: ImageDTO.nullable(),
});
export type IngredientDTO = z.infer<typeof IngredientDTO>;

export const CreateIngredientDTO = IngredientDTO.omit({ id: true, tags: true });
export type CreateIngredientDTO = z.infer<typeof CreateIngredientDTO>;

export const UpdateIngredientDTO = IngredientDTO.pick({ id: true }).extend(CreateIngredientDTO.partial().shape);
export type UpdateIngredientDTO = z.infer<typeof UpdateIngredientDTO>;
