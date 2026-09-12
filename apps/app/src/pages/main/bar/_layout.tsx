import { Outlet } from 'react-router';
import { MainSidebar } from '~/components/sidebar';
import { styles } from '~/styles/constants';

const style = {
  ...styles.bottomNavbarGuard,
  ...styles.mainSidebarGuard,
};

export function BarLayout() {
  return (
    <div className="ml-18 h-dvh w-dvw overflow-y-auto" style={style}>
      <MainSidebar />
      <Outlet />
    </div>
  );
}
