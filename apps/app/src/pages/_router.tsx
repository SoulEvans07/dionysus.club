import { Navigate } from 'react-router';

import { createRouter } from '~/utils/router';
import { ErrorBoundary } from './_error';
import { RootLayout } from './_layout';
import { HomePage } from './home';
import { settingsRouter } from './settings/_router';

export const appRoutes = createRouter([
  {
    path: '/',
    ErrorBoundary,
    Component: RootLayout,
    children: [
      { index: true, element: <Navigate to="/home" /> },
      { path: 'home', Component: HomePage },
      ...settingsRouter,
    ],
  },
]);
