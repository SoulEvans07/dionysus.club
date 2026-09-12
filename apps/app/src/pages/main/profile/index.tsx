import { H1 } from '~/components/common';
import { useCurrentUser } from '~/queries/auth';

export function ProfileScreen() {
  const { data: currentUser } = useCurrentUser();
  const handleLogout = () => (window.location.href = '/api/auth/logout');
  const handleReload = () => window.location.reload();

  return (
    <div>
      <H1>Profile</H1>
      {!currentUser && <div>Nothing</div>}
      {currentUser && (
        <pre className="max-w-full overflow-auto whitespace-pre-wrap">{JSON.stringify(currentUser, undefined, 2)}</pre>
      )}
      <button className="rounded bg-indigo-400 p-2 text-indigo-50" onClick={handleLogout}>
        Logout
      </button>

      <button className="rounded bg-indigo-400 p-2 text-indigo-50" onClick={handleReload}>
        Reload
      </button>
    </div>
  );
}
