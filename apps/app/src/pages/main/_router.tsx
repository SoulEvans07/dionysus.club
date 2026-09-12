import { Navigate } from 'react-router';

import { createRouter } from '~/utils/router';
import { MainLayout } from './_layout';
import { barRoutes } from './bar/_router';
import { menuRoutes } from './menu/_router';
import { profileRoutes } from './profile/_router';

export const mainRoutes = createRouter([
  {
    Component: MainLayout,
    children: [{ index: true, element: <Navigate to="/bar" /> }, ...barRoutes, ...menuRoutes, ...profileRoutes],
  },
]);
