import { CocktailDTO } from '@repo/dtos';
import { makePlaceholderList } from '~/utils/placeholders';

const placeholderCocktail: CocktailDTO = {
  id: 'placeholder-cocktail',
  name: 'Classic Old Fashioned',
  description:
    'A timeless cocktail made with bourbon, bitters, and a touch of sweetness, finished with an orange twist.',
  tags: [
    {
      id: 'placeholder-tag-1',
      namespace: 'style',
      key: 'classic',
      name: 'Classic',
      color: '#e8c78a',
      barId: 'placeholder-bar',
      type: 'cocktail',
    },
    {
      id: 'placeholder-tag-2',
      namespace: 'spirit',
      key: 'whiskey',
      name: 'Whiskey',
      color: '#b77b56',
      barId: 'placeholder-bar',
      type: 'cocktail',
    },
  ],
  recipe: [
    {
      ingredient: {
        id: 'placeholder-ingredient-1',
        name: 'Bourbon whiskey',
        description: '',
        available: true,
        tags: [],
        iconImage: null,
        cardImage: null,
      },
      quantity: 60,
      unit: 'ml',
      isGarnish: false,
      isOptional: false,
    },
    {
      ingredient: {
        id: 'placeholder-ingredient-2',
        name: 'Angostura bitters',
        description: '',
        available: true,
        tags: [],
        iconImage: null,
        cardImage: null,
      },
      quantity: 2,
      unit: 'dashes',
      isGarnish: false,
      isOptional: false,
    },
    {
      ingredient: {
        id: 'placeholder-ingredient-3',
        name: 'Orange peel',
        description: '',
        available: true,
        tags: [],
        iconImage: null,
        cardImage: null,
      },
      quantity: 1,
      unit: 'twist',
      isGarnish: false,
      isOptional: false,
    },
  ],
  steps: [
    { index: 0, description: 'Add the demerara syrup and bitters to a rocks glass and stir.', image: null },
    { index: 1, description: 'Add the bourbon and one large ice cube, then stir for 20 seconds.', image: null },
    { index: 2, description: 'Express an orange twist over the glass and drop it in.', image: null },
  ],
  iconImage: null,
  cardImage: null,
};

export const cocktails = {
  single: placeholderCocktail,
  list: makePlaceholderList(7, placeholderCocktail),
};
