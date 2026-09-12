import { H1 } from '~/components/common';
import { useCurrentUser } from '~/auth';

export function ProfileScreen() {
  const { data: currentUser } = useCurrentUser();

  return (
    <div>
      <H1>Profile</H1>
      {!currentUser && <div>Nothing</div>}
      {currentUser && (
        <pre className="max-w-full overflow-auto whitespace-pre-wrap">{JSON.stringify(currentUser, undefined, 2)}</pre>
      )}
    </div>
  );
}
