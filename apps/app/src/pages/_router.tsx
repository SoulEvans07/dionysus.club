import { Navigate } from 'react-router';

import { createRouter } from '~/utils/router';
import { AuthGuard } from './_auth-guard';
import { ErrorBoundary } from './_error';
import { RootLayout } from './_layout';
import { barRoutes } from './bar/_router';
import { menuRoutes } from './menu/_router';
import { profileRoutes } from './profile/_router';

export const appRoutes = createRouter([
  {
    path: '/',
    ErrorBoundary,
    Component: RootLayout,
    children: [
      { index: true, element: <Navigate to="/bar" /> },
      {
        Component: AuthGuard,
        children: [...barRoutes, ...menuRoutes, ...profileRoutes],
      },
      { path: '*', element: <Navigate to="/" /> },
    ],
  },
]);
