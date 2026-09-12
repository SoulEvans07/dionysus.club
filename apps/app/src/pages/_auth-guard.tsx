import { useEffect } from 'react';
import { Outlet } from 'react-router';

import { useCurrentUser, UnauthorizedError } from '~/auth';

export function AuthGuard() {
  const { isPending, error } = useCurrentUser();

  const isUnauthorized = error instanceof UnauthorizedError;

  useEffect(() => {
    if (!isUnauthorized) return;

    const redirect = window.location.pathname + window.location.search;
    window.location.href = `/api/auth/login?redirect=${encodeURIComponent(redirect)}`;
  }, [isUnauthorized]);

  if (isPending || isUnauthorized) return null;
  if (error) throw error;

  return <Outlet />;
}
