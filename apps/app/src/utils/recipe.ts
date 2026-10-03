import type { CocktailDTO } from '@repo/dtos';
import type { VolumeUnit } from '~/stores/settings';

type RecipeItem = CocktailDTO['recipe'][number];

// Bar convention: 1 oz is poured as 30 ml, not the exact 29.57.
const ML_PER_UNIT: Record<VolumeUnit, number> = { ml: 1, cl: 10, oz: 30 };

function isVolumeUnit(unit: string): unit is VolumeUnit {
  return unit in ML_PER_UNIT;
}

// Rounds to what a bartender would actually measure: whole ml, half cl, quarter oz.
function roundForUnit(quantity: number, unit: VolumeUnit) {
  const step = { ml: 1, cl: 0.5, oz: 0.25 }[unit];
  return Math.max(step, Math.round(quantity / step) * step);
}

export function formatAmount(item: Pick<RecipeItem, 'quantity' | 'unit'>, volumeUnit?: VolumeUnit) {
  const sourceUnit = item.unit.toLowerCase();
  if (volumeUnit && isVolumeUnit(sourceUnit) && sourceUnit !== volumeUnit) {
    const converted = (item.quantity * ML_PER_UNIT[sourceUnit]) / ML_PER_UNIT[volumeUnit];
    return formatAmount({ quantity: roundForUnit(converted, volumeUnit), unit: volumeUnit });
  }

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
