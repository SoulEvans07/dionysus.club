import { Link, useLocation } from 'react-router';
import { cva, type VariantProps } from 'class-variance-authority';
import { type LucideIcon } from 'lucide-react';
import { styles } from '~/styles/constants';

export type BottomNavBarProps = {
  navItems: NavItem[];
};

export function NavBar(props: BottomNavBarProps) {
  const { navItems } = props;

  const { pathname } = useLocation();

  return (
    <nav
      className="relative grid w-full auto-cols-fr grid-flow-col rounded-full border border-indigo-200 bg-indigo-100 p-0.5"
      style={styles.bottomNavbar}
    >
      {navItems.map((item) => (
        <NavButton key={item.label} {...item} active={pathname.startsWith(item.route)} />
      ))}
    </nav>
  );
}

const navButton = cva('flex flex-col items-center justify-center', {
  variants: {
    active: {
      false: 'fill-indigo-300 text-indigo-300',
      true: 'bg-indigo-200 fill-indigo-800 text-indigo-800',
    },
  },
  defaultVariants: {
    active: false,
  },
});

type NavItem = {
  route: string;
  Icon: LucideIcon;
  label: string;
};

type NavItemProps = NavItem & VariantProps<typeof navButton>;

function NavButton(props: NavItemProps) {
  const { route, Icon, label, active } = props;

  return (
    <Link
      to={route}
      className={navButton({ active })}
      style={{
        height: `calc(${styles.bottomNavbar.height} - 6px)`,
        borderRadius: `calc(${styles.bottomNavbar.height} - 6px)`,
      }}
    >
      <Icon className="h-10 w-10 p-1.5" />
      <span className="text-sm">{label}</span>
    </Link>
  );
}
