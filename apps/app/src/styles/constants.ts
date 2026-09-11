import type { CSSProperties } from 'react';

export const styles = {
  bottomNavbar: {
    height: '4rem',
    borderRadius: '4rem',
    margin: '1.5rem',
  },
} as const satisfies Record<string, CSSProperties>;
