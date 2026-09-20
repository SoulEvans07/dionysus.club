import { TOP_LEVEL_TAG_NAMESPACE } from '@repo/dtos';
import type { tagTypeEnum } from '~/database/schema';

type DefaultTag = {
  type: (typeof tagTypeEnum.enumValues)[number];
  namespace: string;
  key: string;
  name: string;
  color: string;
};

// Global defaults, owned by the system bar - available to every bar. Not exhaustive,
// just enough to exercise the namespace/type shape discussed for the tags feature.
export const defaultTags: DefaultTag[] = [
  { type: 'both', namespace: 'spirit', key: 'vodka', name: 'Vodka', color: '#E2E8F0' },
  { type: 'both', namespace: 'spirit', key: 'gin', name: 'Gin', color: '#86EFAC' },
  { type: 'both', namespace: 'spirit', key: 'rum', name: 'Rum', color: '#F59E0B' },
  { type: 'both', namespace: 'spirit', key: 'whiskey', name: 'Whiskey', color: '#B45309' },
  { type: 'both', namespace: 'spirit', key: 'tequila', name: 'Tequila', color: '#FBBF24' },
  { type: 'both', namespace: 'spirit', key: 'brandy', name: 'Brandy', color: '#C2410C' },

  { type: 'both', namespace: 'taste', key: 'sour', name: 'Sour', color: '#FDE047' },
  { type: 'both', namespace: 'taste', key: 'sweet', name: 'Sweet', color: '#F9A8D4' },
  { type: 'both', namespace: 'taste', key: 'bitter', name: 'Bitter', color: '#78350F' },
  { type: 'both', namespace: 'taste', key: 'refreshing', name: 'Refreshing', color: '#5EEAD4' },

  { type: 'cocktail', namespace: 'str', key: 'light', name: 'Light', color: '#BBF7D0' },
  { type: 'cocktail', namespace: 'str', key: 'medium', name: 'Medium', color: '#FDBA74' },
  { type: 'cocktail', namespace: 'str', key: 'strong', name: 'Strong', color: '#F87171' },

  { type: 'ingredient', namespace: 'cat', key: 'spirit', name: 'Spirit', color: '#A78BFA' },
  { type: 'ingredient', namespace: 'cat', key: 'liqueur', name: 'Liqueur', color: '#F472B6' },
  { type: 'ingredient', namespace: 'cat', key: 'wine', name: 'Wine', color: '#FB7185' },
  { type: 'ingredient', namespace: 'cat', key: 'beer', name: 'Beer', color: '#D97706' },
  { type: 'ingredient', namespace: 'cat', key: 'bitters', name: 'Bitters', color: '#92400E' },
  { type: 'ingredient', namespace: 'cat', key: 'juice', name: 'Juice', color: '#FB923C' },
  { type: 'ingredient', namespace: 'cat', key: 'syrup', name: 'Syrup', color: '#FCD34D' },
  { type: 'ingredient', namespace: 'cat', key: 'mixer', name: 'Mixer', color: '#7DD3FC' },
  { type: 'ingredient', namespace: 'cat', key: 'garnish', name: 'Garnish', color: '#86EFAC' },
  { type: 'ingredient', namespace: 'cat', key: 'pantry', name: 'Pantry', color: '#D6D3D1' },

  { type: 'ingredient', namespace: 'contains', key: 'egg', name: 'Egg', color: '#FEF08A' },
  { type: 'ingredient', namespace: 'contains', key: 'dairy', name: 'Dairy', color: '#E0F2FE' },
  { type: 'ingredient', namespace: 'contains', key: 'honey', name: 'Honey', color: '#FBBF24' },
  { type: 'ingredient', namespace: 'contains', key: 'nuts', name: 'Nuts', color: '#A16207' },

  { type: 'both', namespace: TOP_LEVEL_TAG_NAMESPACE, key: 'vegan', name: 'Vegan', color: '#4ADE80' },
  { type: 'both', namespace: TOP_LEVEL_TAG_NAMESPACE, key: 'seasonal', name: 'Seasonal', color: '#C4B5FD' },
];

// Tag refs are `namespace:key`. Tags are unique per (type, namespace, key), and none of the
// namespace/key pairs above are reused across types, so a ref resolves to exactly one tag.
export const tagRef = (tag: Pick<DefaultTag, 'namespace' | 'key'>) => `${tag.namespace}:${tag.key}`;

const VEGAN_TAG = `${TOP_LEVEL_TAG_NAMESPACE}:vegan`;
const NON_VEGAN_TAGS = ['contains:egg', 'contains:dairy', 'contains:honey'];

// Explicit tags per ingredient name (see ingredients.json). `spirit/*` tags mark the base spirit
// and are what cocktails inherit their own spirit tags from. Untagged names (e.g. Kevert) are
// ones we don't know enough about to categorize.
const ingredientTags: Record<string, string[]> = {
  Amaretto: ['cat:liqueur', 'contains:nuts', 'taste:sweet'],
  'Angostura bitters': ['cat:bitters', 'taste:bitter'],
  Benedictine: ['cat:liqueur', 'taste:sweet'],
  'Blue curacao': ['cat:liqueur', 'taste:sweet'],
  'Bourbon whisky': ['cat:spirit', 'spirit:whiskey'],
  Brandy: ['cat:spirit', 'spirit:brandy'],
  Campari: ['cat:liqueur', 'taste:bitter'],
  Champagne: ['cat:wine'],
  Coffee: ['cat:mixer', 'taste:bitter'],
  'Coffee liqueur': ['cat:liqueur', 'taste:sweet'],
  Cointreau: ['cat:liqueur', 'taste:sweet'],
  'Creme of Coconut': ['cat:pantry', 'taste:sweet'],
  Cucumber: ['cat:garnish', 'taste:refreshing'],
  'Dark rum': ['cat:spirit', 'spirit:rum'],
  'Demerara syrup': ['cat:syrup', 'taste:sweet'],
  'Dry vermouth': ['cat:wine'],
  'Egg white': ['cat:pantry', 'contains:egg'],
  'Elderflower liqueur': ['cat:liqueur', 'taste:sweet'],
  Gin: ['cat:spirit', 'spirit:gin'],
  'Ginger beer': ['cat:mixer', 'taste:refreshing'],
  'Grapefruit juice': ['cat:juice', 'taste:sour', 'taste:bitter'],
  Grenadine: ['cat:syrup', 'taste:sweet'],
  Guinness: ['cat:beer', 'taste:bitter'],
  'Heavy cream': ['cat:pantry', 'contains:dairy'],
  'Honey syrup': ['cat:syrup', 'contains:honey', 'taste:sweet'],
  'Lemon juice': ['cat:juice', 'taste:sour'],
  'Lemon twist': ['cat:garnish'],
  'Lime juice': ['cat:juice', 'taste:sour'],
  'Coconut liqueur': ['cat:liqueur', 'taste:sweet'],
  'Maraschino liqueur': ['cat:liqueur', 'taste:sweet'],
  Mint: ['cat:garnish', 'taste:refreshing'],
  'Orange bitters': ['cat:bitters', 'taste:bitter'],
  'Orange juice': ['cat:juice', 'taste:sweet'],
  'Orange twist': ['cat:garnish'],
  Orgeat: ['cat:syrup', 'contains:nuts', 'taste:sweet'],
  'Pinapple juice': ['cat:juice', 'taste:sweet'],
  'Red vermouth': ['cat:wine', 'taste:bitter'],
  'Rye whisky': ['cat:spirit', 'spirit:whiskey'],
  Salt: ['cat:pantry'],
  Sugar: ['cat:pantry', 'taste:sweet'],
  'Simple syrup': ['cat:syrup', 'taste:sweet'],
  'Sparkling Water': ['cat:mixer', 'taste:refreshing'],
  'Tea Infused Gin': ['cat:spirit', 'spirit:gin'],
  Tequila: ['cat:spirit', 'spirit:tequila'],
  'The Spice syrup': ['cat:syrup', 'taste:sweet'],
  'Triple Sec': ['cat:liqueur', 'taste:sweet'],
  'Violet syrup': ['cat:syrup', 'taste:sweet'],
  Vodka: ['cat:spirit', 'spirit:vodka'],
  'Whipped cream': ['cat:pantry', 'contains:dairy'],
  Whisky: ['cat:spirit', 'spirit:whiskey'],
  'White rum': ['cat:spirit', 'spirit:rum'],
};

// Ingredient tag refs by name. `vegan` is derived: anything not containing egg/dairy/honey.
export function getIngredientTagRefs(name: string): string[] {
  const refs = ingredientTags[name] ?? [];
  const isVegan = !refs.some((ref) => NON_VEGAN_TAGS.includes(ref));
  return isVegan ? [...refs, VEGAN_TAG] : refs;
}

// Explicit cocktail tags by name (see cocktails.json): taste, strength and seasonal.
// Spirit and vegan tags are derived from the recipe in `getCocktailTagRefs`.
const cocktailTags: Record<string, string[]> = {
  'Old Fashioned': ['str:strong', 'taste:bitter'],
  Negroni: ['str:medium', 'taste:bitter'],
  Martini: ['str:strong'],
  Daiquiri: ['str:medium', 'taste:sour'],
  'Whisky Sour': ['str:medium', 'taste:sour'],
  Margarita: ['str:medium', 'taste:sour'],
  Mojito: ['str:light', 'taste:refreshing', `${TOP_LEVEL_TAG_NAMESPACE}:seasonal`],
  Manhattan: ['str:strong', 'taste:sweet'],
  Aviation: ['str:medium', 'taste:sour'],
  Sidecar: ['str:medium', 'taste:sour'],
  'White Lady': ['str:medium', 'taste:sour'],
  'Black Russian': ['str:strong', 'taste:sweet'],
  'White Russian': ['str:medium', 'taste:sweet'],
  'Espresso Martini': ['str:medium', 'taste:sweet', 'taste:bitter'],
  Paloma: ['str:light', 'taste:refreshing', 'taste:sour', `${TOP_LEVEL_TAG_NAMESPACE}:seasonal`],
  'Bees Knees': ['str:medium', 'taste:sour', 'taste:sweet'],
  Southside: ['str:medium', 'taste:refreshing', 'taste:sour'],
  'Tequila Sunrise': ['str:light', 'taste:sweet'],
  'Pina Colada': ['str:light', 'taste:sweet', `${TOP_LEVEL_TAG_NAMESPACE}:seasonal`],
  "Dark 'n' Stormy": ['str:light', 'taste:refreshing'],
};

export function getCocktailTagRefs(name: string, ingredientNames: string[]): string[] {
  const ingredientRefs = ingredientNames.map(getIngredientTagRefs);
  const spirits = ingredientRefs.flat().filter((ref) => ref.startsWith('spirit:'));
  const isVegan = ingredientRefs.every((refs) => refs.includes(VEGAN_TAG));

  return [...new Set([...(cocktailTags[name] ?? []), ...spirits, ...(isVegan ? [VEGAN_TAG] : [])])];
}
