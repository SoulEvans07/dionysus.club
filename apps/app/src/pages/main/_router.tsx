import { createRouter } from '~/utils/router';
import { LoadingScreen } from '../_loading';
import { MainLayout } from './_layout';
import { NavToBar } from './_index';
import { barRoutes } from './bar/_router';
import { menuRoutes } from './menu/_router';
import { profileRoutes } from './profile/_router';
import { queryClient } from '~/queries/_client';
import { sidebarQuery } from '~/queries/sidebar';
import { currentUserQuery } from '~/queries/auth';

export const mainRoutes = createRouter([
  {
    Component: MainLayout,
    loader: bootstrap,
    HydrateFallback: LoadingScreen,
    children: [{ index: true, Component: NavToBar }, ...barRoutes, ...menuRoutes, ...profileRoutes],
  },
]);

async function bootstrap() {
  await Promise.all([
    await queryClient.query({ ...currentUserQuery, staleTime: 'static' }),
    await queryClient.query({ ...sidebarQuery, staleTime: 'static' }),
  ]);
}
