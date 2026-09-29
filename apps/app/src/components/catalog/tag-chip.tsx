import { Link } from 'react-router';

import { cn } from '~/utils/classnames';
import { focusRing } from '../common';

type TagChipProps = {
  to: string;
  className?: string;
};
export function TagChip(props: React.PropsWithChildren<TagChipProps>) {
  const { children, to, className } = props;

  return (
    <Link
      to={to}
      className={cn(
        'inline-flex rounded-full bg-slate-200 px-3 py-1 text-sm text-slate-700 transition-colors hover:bg-slate-300',
        focusRing,
        className
      )}
    >
      {children}
    </Link>
  );
}
