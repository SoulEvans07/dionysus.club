import { createRouter } from '~/utils/router';
import { CocktailListScreen } from './index';
import { CocktailScreen } from './[id]';

export const barCocktailsRoutes = createRouter([
  {
    path: 'cocktails',
    children: [
      { index: true, Component: CocktailListScreen },
      { path: ':id', Component: CocktailScreen },
    ],
  },
]);
