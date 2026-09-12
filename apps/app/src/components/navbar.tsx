import { useLayoutEffect, useRef, type CSSProperties, type PropsWithChildren } from 'react';
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
  const activeIndex = navItems.findIndex((item) => pathname.startsWith(item.route));

  const previousActiveIndexRef = useRef(activeIndex);

  useLayoutEffect(() => {
    if (activeIndex !== previousActiveIndexRef.current && activeIndex !== -1 && previousActiveIndexRef.current !== -1) {
      document.documentElement.dataset.navDirection = activeIndex > previousActiveIndexRef.current ? 'rtl' : 'ltr';
    }
    previousActiveIndexRef.current = activeIndex;
  }, [activeIndex]);

  return (
    <nav
      className="relative grid w-full rounded-full border border-indigo-200 bg-indigo-100 p-0.5"
      style={{
        ...styles.bottomNavbar,
        gridTemplateColumns: `repeat(${navItems.length}, minmax(0, 1fr))`,
        viewTransitionName: 'navbar',
      }}
    >
      {navItems.map((item, index) => (
        <NavButton key={item.label} {...item} active={index === activeIndex} index={index} />
      ))}
      {activeIndex !== -1 && (
        <div
          aria-hidden
          className="z-10 rounded-full bg-indigo-200"
          style={
            {
              gridColumn: activeIndex + 1,
              gridRow: 1,
              height: `calc(${styles.bottomNavbar.height} - 6px)`,
              viewTransitionName: 'nav-indicator',
            } as CSSProperties
          }
        />
      )}
    </nav>
  );
}

const navButton = cva('relative z-20 flex flex-col items-center justify-center', {
  variants: {
    active: {
      false: 'fill-indigo-300 text-indigo-300',
      true: 'fill-indigo-800 text-indigo-800',
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

type NavItemProps = NavItem & VariantProps<typeof navButton> & { index: number };

function NavButton(props: NavItemProps) {
  const { route, Icon, label, active, index } = props;

  return (
    <Link
      to={route}
      viewTransition
      className={navButton({ active })}
      style={{
        gridColumn: index + 1,
        gridRow: 1,
        height: `calc(${styles.bottomNavbar.height} - 6px)`,
        borderRadius: `calc(${styles.bottomNavbar.height} - 6px)`,
        viewTransitionName: `nav-item-${index + 1}`,
        viewTransitionClass: 'nav-item',
      }}
    >
      <Icon className="h-10 w-10 p-1.5" />
      <span className="text-xs">{label}</span>
    </Link>
  );
}

export function LayoutContainerWithNavbar(props: PropsWithChildren) {
  return (
    <div
      className="ml-18 h-dvh w-dvw overflow-y-auto"
      style={{ paddingBottom: `calc(${styles.bottomNavbar.height} + 1.25 * ${styles.bottomNavbar.marginBottom})` }}
    >
      {props.children}
    </div>
  );
}
