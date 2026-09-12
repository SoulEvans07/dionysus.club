import { Outlet } from 'react-router';
import {
  Martini,
  // BookOpen,
  // BookOpenText,
  // Notebook,
  NotebookTabs,
  // Calendar,
  UsersRound,
  // CircleUserRound
} from 'lucide-react';

import { NavBar, type BottomNavBarProps } from '~/components/navbar';

export function MainLayout() {
  return (
    <>
      <Outlet />
      <div className="fixed bottom-0 left-0 right-0 flex items-center justify-center">
        <NavBar navItems={bottomNavItems} />
      </div>
    </>
  );
}

const bottomNavItems: BottomNavBarProps['navItems'] = [
  { label: 'Bar', route: '/bar', Icon: Martini },
  { label: 'Menu', route: '/menu', Icon: NotebookTabs },
  // { label: 'Events', route: '/events', Icon: Calendar },
  { label: 'Profile', route: '/profile', Icon: UsersRound },
];
