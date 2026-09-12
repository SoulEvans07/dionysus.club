import type { CSSProperties } from 'react';

export const styles = {
  bottomNavbar: {
    height: '3.5rem',
    borderRadius: '3.5rem',
    marginBottom: '1rem',
    marginLeft: '3rem',
    marginRight: '3rem',
  },
} as const satisfies Record<string, CSSProperties>;
