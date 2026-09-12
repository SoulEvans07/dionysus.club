import { Navigate, redirect } from 'react-router';

import { createRouter } from '~/utils/router';
import { ErrorBoundary } from './_error';
import { RootLayout } from './_layout';
import { queryClient } from '~/queries/_client';
import { currentUserQuery } from '~/queries/auth';
import { UnauthorizedError } from '~/types/error';
import { LoadingScreen } from './_loading';
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
      { loader: authGuard, HydrateFallback: LoadingScreen, children: mainRoutes },
      { path: '*', element: <Navigate to="/" /> },
    ],
  },
]);

async function authGuard() {
  try {
    await queryClient.query({ ...currentUserQuery, staleTime: 'static' });
    return null;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      const redirectUri = window.location.pathname + window.location.search;
      throw redirect(`/login?redirect=${encodeURIComponent(redirectUri)}`);
    }
    throw error;
  }
}
