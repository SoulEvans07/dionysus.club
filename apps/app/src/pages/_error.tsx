import { useEffect } from 'react';
import { useRouteError } from 'react-router';

export function ErrorBoundary() {
  const error = useRouteError();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div role="alert">
      <h1>oops!</h1>
      <p>Something went wrong:</p>
      <pre className="text-red-700">{JSON.stringify(error, undefined, 2)}</pre>
    </div>
  );
}
