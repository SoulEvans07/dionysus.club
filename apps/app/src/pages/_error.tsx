import { useRouteError } from 'react-router';

export function ErrorBoundary() {
  const error = useRouteError();

  return (
    <div role="alert">
      <h1>oops!</h1>
      <p>Something went wrong:</p>
      <pre className="text-red-700">{JSON.stringify(error, undefined, 2)}</pre>
    </div>
  );
}
