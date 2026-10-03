import { z } from 'zod';

export const TagType = z.enum(['cocktail', 'ingredient', 'both']);
export type TagType = z.infer<typeof TagType>;

// Lowercase slug: no whitespace, matches what's typed to reference a tag (e.g. "spirit:vodka").
const TagSlug = z
  .string()
  .min(1, 'Required')
  .max(64)
  .regex(/^[a-z0-9_-]+$/, 'Use lowercase letters, numbers, - or _');

export const TagDTO = z.object({
  id: z.string(),
  barId: z.string(),
  type: TagType,
  namespace: TagSlug,
  key: TagSlug,
  name: z.string(),
  color: z.string(),
});
export type TagDTO = z.infer<typeof TagDTO>;

export const CreateTagDTO = TagDTO.omit({ id: true, barId: true }).extend({
  name: z.string().trim().min(1, 'Name is required').max(256),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Pick a color'),
});
export type CreateTagDTO = z.infer<typeof CreateTagDTO>;

export const UpdateTagDTO = TagDTO.pick({ id: true }).extend(CreateTagDTO.partial().shape);
export type UpdateTagDTO = z.infer<typeof UpdateTagDTO>;
