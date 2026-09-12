import { useEffect } from 'react';
import { Outlet } from 'react-router';

import { useCurrentUser, UnauthorizedError } from '~/auth';

export function AuthGuard() {
  const { isPending, error } = useCurrentUser();

  const isUnauthorized = error instanceof UnauthorizedError;

  useEffect(() => {
    if (isUnauthorized) window.location.href = '/api/auth/login';
  }, [isUnauthorized]);

  if (isPending || isUnauthorized) return null;
  if (error) throw error;

  return <Outlet />;
}
