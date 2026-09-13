import { createRouter } from '~/utils/router';
import { IngredientListScreen } from './index';
import { IngredientScreen } from './[id]';

export const barIngredientsRoutes = createRouter([
  {
    path: 'ingredients',
    children: [
      { index: true, Component: IngredientListScreen },
      { path: ':id', Component: IngredientScreen },
    ],
  },
]);
