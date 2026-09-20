import { z } from 'zod';
import { IngredientDTO } from './ingredient';
import { TagDTO } from './tag';

export const RecipeItemDTO = z.object({
  ingredient: IngredientDTO,
  quantity: z.number(),
  unit: z.string(),
  isOptional: z.boolean(),
  isGarnish: z.boolean(),
});

export const CocktailDTO = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  recipe: RecipeItemDTO.array(),
  tags: TagDTO.array(),
});
export type CocktailDTO = z.infer<typeof CocktailDTO>;

export const CreateCocktailDTO = CocktailDTO.omit({ id: true, recipe: true, tags: true });
export type CreateCocktailDTO = z.infer<typeof CreateCocktailDTO>;

export const UpdateCocktailDTO = CocktailDTO.pick({ id: true }).extend(CreateCocktailDTO.partial().shape);
export type UpdateCocktailDTO = z.infer<typeof UpdateCocktailDTO>;

export const AddRecipeItemToCocktailDTO = z.object({
  ingredientId: z.string(),
  quantity: z.number(),
  unit: z.string(),
  isOptional: z.boolean().default(false),
  isGarnish: z.boolean().default(false),
});
export type AddRecipeItemToCocktailDTO = z.infer<typeof AddRecipeItemToCocktailDTO>;


export const CocktailListQueryParams = z.object({
  tag: z.string().optional(),
});
export type CocktailListQueryParams = z.infer<typeof CocktailListQueryParams>;
