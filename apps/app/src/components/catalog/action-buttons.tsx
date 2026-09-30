import { ListFilter, Pencil, Plus, Search } from 'lucide-react';
import { Link } from 'react-router';

import { cn } from '~/utils/classnames';
import { focusRing } from '../common';

type ActionLinkProps = {
  to: string;
  label: string;
  className?: string;
};

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

type SearchButtonProps = {
  className?: string;
  onClick?: VoidFunction;
  active?: boolean;
};
export function SearchButton(props: SearchButtonProps) {
  const { className, onClick, active } = props;

  return (
    <button
      aria-label="Search"
      className={cn(
        'relative grid size-10 place-items-center rounded-full bg-slate-900 text-white backdrop-blur transition-colors active:bg-slate-900/75',
        focusRing,
        className
      )}
      onClick={onClick}
    >
      {active && <div className="pointer-events-none absolute bottom-0 right-0 size-2.5 rounded-full bg-slate-400" />}
      <Search className="size-5" />
    </button>
  );
}

type FilterButtonProps = {
  className?: string;
  onClick?: VoidFunction;
  active?: boolean;
};
export function FilterButton(props: FilterButtonProps) {
  const { className, onClick, active } = props;

  return (
    <button
      aria-label="Filters"
      className={cn(
        'relative grid size-10 place-items-center rounded-full bg-slate-900 text-white backdrop-blur transition-colors active:bg-slate-900/75',
        focusRing,
        className
      )}
      onClick={onClick}
    >
      {active && <div className="pointer-events-none absolute bottom-0 right-0 size-2.5 rounded-full bg-slate-400" />}
      <ListFilter className="size-5" />
    </button>
  );
}
