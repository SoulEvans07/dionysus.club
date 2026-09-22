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

// Images aren't part of create/update yet - they'll come with the upload flow.
export const CreateIngredientDTO = z.object({
  name: z.string().trim().min(1, 'Name is required').max(256),
  description: z.string().trim().max(2000),
  available: z.boolean(),
  tagIds: z.guid().array(),
});
export type CreateIngredientDTO = z.infer<typeof CreateIngredientDTO>;

export const UpdateIngredientDTO = IngredientDTO.pick({ id: true }).extend(CreateIngredientDTO.partial().shape);
export type UpdateIngredientDTO = z.infer<typeof UpdateIngredientDTO>;

export const SetIngredientAvailabilityDTO = z.object({
  available: z.boolean(),
});
export type SetIngredientAvailabilityDTO = z.infer<typeof SetIngredientAvailabilityDTO>;

export const IngredientListQueryParams = z.object({
  tag: z.string().optional(),
});
export type IngredientListQueryParams = z.infer<typeof IngredientListQueryParams>;
