import { Pencil, Plus } from 'lucide-react';
import { Link } from 'react-router';

import { cn } from '~/utils/classnames';
import { focusRing } from './common';

type ActionLinkProps = { to: string; label: string; className?: string };

// Round pencil button that sits on top of a detail screen's photo, opposite the back button.
export function EditLink(props: ActionLinkProps) {
  const { to, label, className } = props;

  return (
    <Link
      to={to}
      aria-label={label}
      className={cn(
        'grid size-10 place-items-center rounded-full bg-slate-900/60 text-white backdrop-blur transition-colors hover:bg-slate-900/75',
        focusRing,
        className
      )}
    >
      <Pencil className="size-4" />
    </Link>
  );
}

// Round plus button for a list header.
export function NewLink(props: ActionLinkProps) {
  const { to, label, className } = props;

  return (
    <Link
      to={to}
      aria-label={label}
      className={cn(
        'grid size-10 shrink-0 place-items-center rounded-full bg-slate-900 text-white transition-colors hover:bg-slate-800',
        focusRing,
        className
      )}
    >
      <Plus className="size-5" />
    </Link>
  );
}
