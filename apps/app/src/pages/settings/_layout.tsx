import { Outlet, useLocation } from 'react-router';
import { User, Cog } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';

import { tw } from '~/utils/twElem';
import { H1 } from '~/components/common';

export function Layout() {
  const { pathname } = useLocation();

  return (
    <div className="flex h-full w-full flex-1 flex-row gap-1">
      <nav className="flex w-[20rem] min-w-[20rem] flex-col gap-1 rounded-tr-sm bg-slate-900 p-2">
        <H1>Settings</H1>
        <NavItem href="/settings/profile" active={pathname.startsWith('/settings/profile')}>
          <User />
          <span>Profile</span>
        </NavItem>
        <NavItem href="/settings/general" active={pathname.startsWith('/settings/general')}>
          <Cog />
          <span>General</span>
        </NavItem>
      </nav>
      <div className="h-full w-full rounded-tl-sm bg-slate-800 p-2">
        <Outlet />
      </div>
    </div>
  );
}

const NavBtn = tw.a(
  'text-slate-100 w-full flex justify-start items-center gap-2 rounded-sm hover:bg-slate-700 transition duration-150 ease-in-out py-2 px-2'
);

const navButton = cva(
  'text-slate-100 w-full flex justify-start items-center gap-2 rounded-sm hover:bg-slate-600 active:bg-slate-500 transition duration-150 ease-in-out py-2 px-2',
  {
    variants: {
      active: {
        false: '',
        true: 'bg-slate-700',
      },
    },
    defaultVariants: {
      active: false,
    },
  }
);

interface NavItemProps extends React.PropsWithChildren<VariantProps<typeof navButton>> {
  href: string;
}

function NavItem(props: NavItemProps) {
  const { href, children, active } = props;

  return (
    <a href={href} className={navButton({ active })}>
      {children}
    </a>
  );
}
