import { createRouter } from '~/utils/router';
import { CocktailListScreen } from './index';
import { CocktailScreen } from './[id]';
import { CocktailCreateScreen } from './new';
import { CocktailEditScreen } from './edit';

export const barCocktailsRoutes = createRouter([
  {
    path: 'cocktails',
    children: [
      { index: true, Component: CocktailListScreen },
      { path: 'new', Component: CocktailCreateScreen },
      { path: ':id', Component: CocktailScreen },
      { path: ':id/edit', Component: CocktailEditScreen },
    ],
  },
]);
