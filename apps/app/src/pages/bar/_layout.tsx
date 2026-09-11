import { Outlet } from 'react-router';
import { styles } from '~/styles/constants';

export function BarLayout() {
  return (
    <div
      className="h-dvh w-dvw overflow-y-auto"
      style={{ paddingBottom: `calc(${styles.bottomNavbar.height} + 1.25 * ${styles.bottomNavbar.margin})` }}
    >
      <Outlet />
    </div>
  );
}
