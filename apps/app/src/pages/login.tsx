import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { z } from 'zod';

const SearchParams = z.looseObject({
  redirect: z.string().nullish(),
});

export function LoginScreen() {
  const [searchParams] = useSearchParams();
  const { redirect } = useMemo(() => SearchParams.parse(searchParams), [searchParams]);
  const handleLogin = useCallback(() => {
    window.location.href = redirect ? `/api/auth/login?redirect=${redirect}` : '/api/auth/login';
  }, [redirect]);

  return (
    <div>
      <h1>Login Page</h1>
      <button className="rounded bg-indigo-400 p-2 text-indigo-50" onClick={handleLogin}>
        Login
      </button>
    </div>
  );
}
