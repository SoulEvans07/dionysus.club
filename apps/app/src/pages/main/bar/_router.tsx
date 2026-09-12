import { createRouter } from '~/utils/router';
import { queryClient } from '~/queries/_client';
import { sidebarQuery } from '~/queries/sidebar';
import { BarLayout } from './_layout';
import { BarScreen } from './index';

export const barRoutes = createRouter([
  {
    path: 'bar',
    loader,
    Component: BarLayout,
    children: [{ index: true, Component: BarScreen }],
  },
]);

async function loader() {
  await queryClient.query({ ...sidebarQuery, staleTime: 'static' });
}
