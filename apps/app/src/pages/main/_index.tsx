import { Navigate } from 'react-router';
import { useCurrentUser } from '~/queries/auth';

export function NavToBar() {
  const { data: currentUser } = useCurrentUser();

  if (!currentUser?.personalBarId) return null;

  return <Navigate to={`/bar/${currentUser.personalBarId}`} />;
}
