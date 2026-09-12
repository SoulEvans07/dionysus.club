import { createRouter } from '~/utils/router';
import { queryClient } from '~/queries/_client';
import { sidebarQuery } from '~/queries/sidebar';
import { BarLayout } from './_layout';
import { BarScreen } from './index';
import { NavToBar } from '../_index';

export const barRoutes = createRouter([
  {
    path: 'bar',
    loader,
    Component: BarLayout,
    children: [
      { index: true, Component: NavToBar },
      { path: ':barId', Component: BarScreen },
    ],
  },
]);

async function loader() {
  await queryClient.query({ ...sidebarQuery, staleTime: 'static' });
}
