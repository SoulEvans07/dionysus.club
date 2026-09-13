import { type LoaderFunctionArgs } from 'react-router';
import { z } from 'zod';

import { createRouter } from '~/utils/router';
import { queryClient } from '~/queries/_client';
import { sidebarQuery } from '~/queries/sidebar';
import { BarLayout } from './_layout';
import { BarScreen } from './[barId]';
import { NavToBar } from '../_index';
import { barIngredientsRoutes } from './ingredients/_router';
import { barCocktailsRoutes } from './cocktails/_router';
import { barGetQuery, barMemeberListQuery } from '~/queries/bar';

export const barRoutes = createRouter([
  {
    path: 'bar',
    loader: loadSidebar,
    children: [
      { index: true, Component: NavToBar },
      {
        path: ':barId',
        loader: loadBar,
        Component: BarLayout,
        children: [{ index: true, Component: BarScreen }],
      },
      { path: ':barId', children: [...barIngredientsRoutes, ...barCocktailsRoutes] },
    ],
  },
]);

async function loadSidebar() {
  await queryClient.query({ ...sidebarQuery, staleTime: 'static' });
}

const BarParams = z.object({ barId: z.string() });
async function loadBar({ params }: LoaderFunctionArgs) {
  const { barId } = BarParams.parse(params);
  await queryClient.query({ ...barGetQuery(barId), staleTime: 'static' });
  await queryClient.query({ ...barMemeberListQuery(barId), staleTime: 'static' });
}
