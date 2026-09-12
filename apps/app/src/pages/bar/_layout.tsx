import { Outlet } from 'react-router';
import { LayoutContainerWithNavbar } from '~/components/navbar';
import { MainSidebar } from '~/components/sidebar';

export function BarLayout() {
  return (
    <LayoutContainerWithNavbar>
      <MainSidebar />
      <Outlet />
    </LayoutContainerWithNavbar>
  );
}
