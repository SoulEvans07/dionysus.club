import { createRouter } from '~/utils/router';
import { IngredientListScreen } from './index';
import { IngredientScreen } from './[id]';
import { IngredientCreateScreen } from './new';
import { IngredientEditScreen } from './edit';

export const barIngredientsRoutes = createRouter([
  {
    path: 'ingredients',
    children: [
      { index: true, Component: IngredientListScreen },
      { path: 'new', Component: IngredientCreateScreen },
      { path: ':id', Component: IngredientScreen },
      { path: ':id/edit', Component: IngredientEditScreen },
    ],
  },
]);
