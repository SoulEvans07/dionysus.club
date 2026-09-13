import type { CSSProperties } from 'react';

const bottomNavbar: CSSProperties = {
  height: '3.5rem',
  borderRadius: '3.5rem',
  marginBottom: '1rem',
  marginLeft: '3rem',
  marginRight: '3rem',
};

export const styles = {
  bottomNavbar,
} as const;

export const sizes = {
  bottomNavbarGuard: `calc(${bottomNavbar.height} + 1.25 * ${bottomNavbar.marginBottom})`,
  mainSidebarGuard: '4.5rem',
};
