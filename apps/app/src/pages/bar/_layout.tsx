import { Outlet } from 'react-router';
import { MainSidebar } from '~/components/sidebar';
import { styles } from '~/styles/constants';

export function BarLayout() {
  return (
    <div
      className="ml-18 h-dvh w-dvw overflow-y-auto"
      style={{ paddingBottom: `calc(${styles.bottomNavbar.height} + 1.25 * ${styles.bottomNavbar.margin})` }}
    >
      <MainSidebar />
      <Outlet />
    </div>
  );
}
