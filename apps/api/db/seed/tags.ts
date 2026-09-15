import { TOP_LEVEL_TAG_NAMESPACE } from '~/database/constants';
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
  { type: 'ingredient', namespace: 'spirit', key: 'vodka', name: 'Vodka', color: '#E2E8F0' },
  { type: 'ingredient', namespace: 'spirit', key: 'gin', name: 'Gin', color: '#86EFAC' },
  { type: 'ingredient', namespace: 'spirit', key: 'rum', name: 'Rum', color: '#F59E0B' },
  { type: 'ingredient', namespace: 'spirit', key: 'whiskey', name: 'Whiskey', color: '#B45309' },
  { type: 'ingredient', namespace: 'spirit', key: 'tequila', name: 'Tequila', color: '#FBBF24' },

  { type: 'both', namespace: 'taste', key: 'sour', name: 'Sour', color: '#FDE047' },
  { type: 'both', namespace: 'taste', key: 'sweet', name: 'Sweet', color: '#F9A8D4' },
  { type: 'both', namespace: 'taste', key: 'bitter', name: 'Bitter', color: '#78350F' },
  { type: 'both', namespace: 'taste', key: 'refreshing', name: 'Refreshing', color: '#5EEAD4' },

  { type: 'cocktail', namespace: 'str', key: '1', name: 'Light', color: '#BBF7D0' },
  { type: 'cocktail', namespace: 'str', key: '3', name: 'Medium', color: '#FDBA74' },
  { type: 'cocktail', namespace: 'str', key: '5', name: 'Strong', color: '#F87171' },

  { type: 'both', namespace: TOP_LEVEL_TAG_NAMESPACE, key: 'vegan', name: 'Vegan', color: '#4ADE80' },
  { type: 'both', namespace: TOP_LEVEL_TAG_NAMESPACE, key: 'seasonal', name: 'Seasonal', color: '#C4B5FD' },
];
