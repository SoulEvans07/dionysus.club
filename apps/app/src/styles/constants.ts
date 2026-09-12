import type { CSSProperties } from 'react';

const bottomNavbar: CSSProperties = {
  height: '3.5rem',
  borderRadius: '3.5rem',
  marginBottom: '1rem',
  marginLeft: '3rem',
  marginRight: '3rem',
};

const bottomNavbarGuard: CSSProperties = {
  paddingBottom: `calc(${bottomNavbar.height} + 1.25 * ${bottomNavbar.marginBottom})`,
};

const mainSidebarGuard: CSSProperties = {
  marginLeft: '4.5rem',
};

export const styles = {
  bottomNavbar,
  bottomNavbarGuard,
  mainSidebarGuard,
} as const;
