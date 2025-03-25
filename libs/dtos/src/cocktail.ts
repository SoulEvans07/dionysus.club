import { z } from 'zod';
import { IngredientDTO } from './ingredient';

export const RecipeItemDTO = z.object({
  ingredient: IngredientDTO,
  amount: z.number(),
  isOptional: z.boolean(),
  isGarnish: z.boolean(),
});

export const CocktailDTO = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  recipe: RecipeItemDTO.array(),
});
export type CocktailDTO = z.infer<typeof CocktailDTO>;

export const CreateCocktailDTO = CocktailDTO.omit({ id: true });
export type CreateCocktailDTO = z.infer<typeof CreateCocktailDTO>;

export const UpdateCocktailDTO = CocktailDTO.pick({ id: true }).merge(CocktailDTO.omit({ id: true }).partial());
export type UpdateCocktailDTO = z.infer<typeof UpdateCocktailDTO>;

export const AddRecipeItemToCocktailDTO = z.object({
  ingredientId: z.string(),
  amount: z.number(),
  isOptional: z.boolean(),
  isGarnish: z.boolean(),
});
export type AddRecipeItemToCocktailDTO = z.infer<typeof AddRecipeItemToCocktailDTO>;
