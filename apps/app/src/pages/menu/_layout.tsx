import { Outlet } from 'react-router';
import { LayoutContainerWithNavbar } from '~/components/navbar';

export function MenuLayout() {
  return (
    <LayoutContainerWithNavbar>
      <Outlet />
    </LayoutContainerWithNavbar>
  );
}
