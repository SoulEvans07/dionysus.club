import { createRouter } from '~/utils/router';
import { queryClient } from '~/queries/_client';
import { sidebarQuery } from '~/queries/sidebar';
import { BarLayout } from './_layout';
import { BarScreen } from './[barId]';
import { NavToBar } from '../_index';
import { barIngredientsRoutes } from './ingredients/_router';
import { barCocktailsRoutes } from './cocktails/_router';

export const barRoutes = createRouter([
  {
    path: 'bar',
    loader,
    children: [
      { index: true, Component: NavToBar },
      { path: ':barId', Component: BarLayout, children: [{ index: true, Component: BarScreen }] },
      { path: ':barId', children: [...barIngredientsRoutes, ...barCocktailsRoutes] },
    ],
  },
]);

async function loader() {
  await queryClient.query({ ...sidebarQuery, staleTime: 'static' });
}
