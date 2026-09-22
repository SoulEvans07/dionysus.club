import { Link } from 'react-router';

import { focusRing } from './common';
import { cn } from '~/utils/classnames';

type TagChipProps = { name: string; to: string; className?: string };

export function TagChip(props: TagChipProps) {
  const { name, to, className } = props;

  return (
    <Link
      to={to}
      className={cn(
        'rounded-full bg-slate-200 px-3 py-1 text-sm text-slate-700 transition-colors hover:bg-slate-300',
        focusRing,
        className
      )}
    >
      {name}
    </Link>
  );
}
