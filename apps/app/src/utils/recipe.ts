import type { CocktailDTO } from '@repo/dtos';

type RecipeItem = CocktailDTO['recipe'][number];

export function formatAmount(item: Pick<RecipeItem, 'quantity' | 'unit'>) {
  const quantity = Number.isInteger(item.quantity) ? String(item.quantity) : String(Number(item.quantity.toFixed(2)));
  const unit = item.unit === 'pcs' && item.quantity === 1 ? 'pc' : item.unit;
  return `${quantity} ${unit}`;
}

// Garnishes and optional lines never block a drink, so they don't count as missing.
export function missingIngredients(cocktail: Pick<CocktailDTO, 'recipe'>) {
  return cocktail.recipe
    .filter((item) => !item.isOptional && !item.isGarnish && !item.ingredient.available)
    .map((item) => item.ingredient);
}

export function canMake(cocktail: Pick<CocktailDTO, 'recipe'>) {
  return cocktail.recipe.length > 0 && missingIngredients(cocktail).length === 0;
}

export function recipeSummary(cocktail: Pick<CocktailDTO, 'recipe'>) {
  return cocktail.recipe
    .filter((item) => !item.isGarnish)
    .map((item) => item.ingredient.name)
    .join(', ');
}

export function recipeItemNote(item: Pick<RecipeItem, 'isOptional' | 'isGarnish'>) {
  if (item.isOptional && item.isGarnish) return 'Optional garnish';
  if (item.isGarnish) return 'Garnish';
  if (item.isOptional) return 'Optional';
  return null;
}

export function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return count === 1 ? singular : plural;
}
