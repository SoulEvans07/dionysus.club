import { Outlet } from 'react-router';
import { styles } from '~/styles/constants';

export function MenuLayout() {
  return (
    <div className="h-dvh w-dvw overflow-y-auto bg-white" style={styles.bottomNavbarGuard}>
      <Outlet />
    </div>
  );
}
