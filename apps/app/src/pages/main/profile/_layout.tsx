import { Outlet } from 'react-router';
import { styles } from '~/styles/constants';

export function ProfileLayout() {
  return (
    <div className="h-dvh w-dvw overflow-y-auto" style={styles.bottomNavbarGuard}>
      <Outlet />
    </div>
  );
}
