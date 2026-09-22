import { z } from 'zod';
import { IngredientDTO } from './ingredient';
import { TagDTO } from './tag';
import { ImageDTO } from './image';

export const RecipeItemDTO = z.object({
  ingredient: IngredientDTO,
  quantity: z.number(),
  unit: z.string(),
  isOptional: z.boolean(),
  isGarnish: z.boolean(),
});

export const RecipeStepDTO = z.object({
  index: z.number(),
  description: z.string(),
  image: ImageDTO.nullable(),
});
export type RecipeStepDTO = z.infer<typeof RecipeStepDTO>;

export const CocktailDTO = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  recipe: RecipeItemDTO.array(),
  steps: RecipeStepDTO.array(),
  tags: TagDTO.array(),
  iconImage: ImageDTO.nullable(),
  cardImage: ImageDTO.nullable(),
});
export type CocktailDTO = z.infer<typeof CocktailDTO>;

export const AddRecipeItemToCocktailDTO = z.object({
  ingredientId: z.guid('Choose an ingredient'),
  quantity: z.number('Enter an amount').positive('Enter an amount'),
  unit: z.string().trim().min(1, 'Enter a unit').max(32),
  isOptional: z.boolean().default(false),
  isGarnish: z.boolean().default(false),
});
export type AddRecipeItemToCocktailDTO = z.infer<typeof AddRecipeItemToCocktailDTO>;

export const RecipeStepInputDTO = z.object({
  description: z.string().trim().min(1, 'Describe this step').max(2000),
  // Carries an already-uploaded step image through a save; the form can't set one yet.
  imageId: z.guid().nullable(),
});
export type RecipeStepInputDTO = z.infer<typeof RecipeStepInputDTO>;

// Saving a cocktail replaces its tags, recipe and steps as a whole (images aren't part of it yet).
export const CreateCocktailDTO = z.object({
  name: z.string().trim().min(1, 'Name is required').max(256),
  description: z.string().trim().max(2000),
  tagIds: z.guid().array(),
  recipe: AddRecipeItemToCocktailDTO.array()
    .min(1, 'Add at least one ingredient')
    // recipe lines are keyed by (cocktail, ingredient), so an ingredient can only appear once
    .refine((items) => new Set(items.map((i) => i.ingredientId)).size === items.length, {
      message: 'Each ingredient can only be used once',
    }),
  steps: RecipeStepInputDTO.array(),
});
export type CreateCocktailDTO = z.infer<typeof CreateCocktailDTO>;

export const UpdateCocktailDTO = CocktailDTO.pick({ id: true }).extend(CreateCocktailDTO.partial().shape);
export type UpdateCocktailDTO = z.infer<typeof UpdateCocktailDTO>;

export const CocktailListQueryParams = z.object({
  tag: z.string().optional(),
});
export type CocktailListQueryParams = z.infer<typeof CocktailListQueryParams>;
