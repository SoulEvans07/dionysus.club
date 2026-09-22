import type { ReactNode } from 'react';

import { focusRing } from '~/components/catalog/common';
import { cn } from '~/utils/classnames';

type IconButtonProps = { label: string; onClick: () => void; disabled?: boolean; children: ReactNode };

export function IconButton(props: IconButtonProps) {
  const { label, onClick, disabled, children } = props;

  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'grid size-9 shrink-0 place-items-center rounded-lg text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900 disabled:pointer-events-none disabled:opacity-30',
        focusRing
      )}
    >
      {children}
    </button>
  );
}
