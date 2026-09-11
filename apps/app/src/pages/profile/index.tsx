import { useState, useEffect } from 'react';
import { H1 } from '~/components/common';

export function ProfileScreen() {
  const [data, setData] = useState<unknown | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => setData(data));
  }, []);

  return (
    <div>
      <H1>Profile</H1>
      <pre className="max-w-full overflow-auto whitespace-pre-wrap">{JSON.stringify(data, undefined, 2)}</pre>
    </div>
  );
}
