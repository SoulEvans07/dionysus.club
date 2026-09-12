import { Outlet } from 'react-router';
import { LayoutContainerWithNavbar } from '~/components/navbar';

export function ProfileLayout() {
  return (
    <LayoutContainerWithNavbar>
      <Outlet />
    </LayoutContainerWithNavbar>
  );
}
