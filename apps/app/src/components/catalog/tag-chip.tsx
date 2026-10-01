import { Link } from 'react-router';

import { TagDTO } from '@repo/dtos';
import { cn } from '~/utils/classnames';
import { focusRing } from '../common';

type TagChipProps = {
  tag: TagDTO;
  to: string;
  className?: string;
};
export function TagChip(props: TagChipProps) {
  const { tag, to, className } = props;

  return (
    <Link
      to={to}
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white py-1 pl-2.5 pr-3 text-sm text-slate-700 transition-colors hover:bg-slate-300',
        focusRing,
        className
      )}
    >
      <span className="size-2 rounded-full border border-white/20" style={{ backgroundColor: tag.color }} />
      <span>{tag.name}</span>
    </Link>
  );
}
