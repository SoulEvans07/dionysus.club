import { useEffect, type PropsWithChildren } from 'react';
import { useCurrentUser, UnauthorizedError } from '~/auth';

export function AuthGuard(props: PropsWithChildren) {
  const { isPending, error } = useCurrentUser();

  const isUnauthorized = error instanceof UnauthorizedError;

  useEffect(() => {
    if (!isUnauthorized) return;

    const redirect = window.location.pathname + window.location.search;
    window.location.href = `/login?redirect=${encodeURIComponent(redirect)}`;
  }, [isUnauthorized]);

  if (isPending || isUnauthorized) return null;
  if (error) throw error;

  return props.children;
}
