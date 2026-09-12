import { Navigate } from 'react-router';

import { createRouter } from '~/utils/router';
import { ErrorBoundary } from './_error';
import { RootLayout } from './_layout';
import { LoginScreen } from './login';
import { mainRoutes } from './main/_router';

export const appRoutes = createRouter([
  {
    path: '/',
    ErrorBoundary,
    Component: RootLayout,
    children: [
      { index: true, element: <Navigate to="/bar" /> },
      { path: 'login', Component: LoginScreen },
      ...mainRoutes,
      { path: '*', element: <Navigate to="/" /> },
    ],
  },
]);
