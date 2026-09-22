import { useMemo } from 'react';
import { Link, Navigate } from 'react-router';
import { Search, X } from 'lucide-react';

import { Input } from '~/components/shadcn/input';
import { useTagList } from '~/queries/tag';
import { cn } from '~/utils/classnames';
import { tagFullKey } from '~/utils/tags';
import { focusRing } from './common';

type SearchFieldProps = { value: string; onChange: (value: string) => void; label: string };

export function SearchField(props: SearchFieldProps) {
  const { value, onChange, label } = props;

  return (
    <div className="relative min-w-0 flex-1">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
      <Input
        type="search"
        aria-label={label}
        placeholder={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 rounded-xl border-slate-200 bg-white pl-9 shadow-none"
      />
    </div>
  );
}

type SegmentedProps<T extends string> = {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
};

export function Segmented<T extends string>(props: SegmentedProps<T>) {
  const { label, value, options, onChange } = props;

  return (
    <div role="group" aria-label={label} className="flex shrink-0 rounded-xl bg-slate-200 p-0.5">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
          className={cn(
            'h-9 rounded-[10px] px-3 text-sm font-medium transition-colors',
            option.value === value ? 'shadow-xs bg-white text-slate-900' : 'text-slate-600 hover:text-slate-900',
            focusRing
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

type TagFilterProps = { barId: string; tagKey: string; clearTo: string };

// Shows the tag a list is filtered by, with a way to clear it.
// Sends the user back to the bar when the tag doesn't exist (stale link).
export function TagFilter(props: TagFilterProps) {
  const { barId, tagKey, clearTo } = props;

  const list = useTagList(barId);
  const tag = useMemo(() => list.data?.find((t) => tagFullKey(t) === tagKey), [list.data, tagKey]);
  if (list.isSuccess && tag === undefined) return <Navigate to={`/bar/${barId}`} replace />;

  return (
    <Link
      to={clearTo}
      aria-label={tag ? `Remove filter ${tag.name}` : 'Remove filter'}
      className={cn(
        'inline-flex h-8 items-center gap-1.5 self-start rounded-full bg-slate-900 pl-3 pr-2 text-sm font-medium text-white',
        { skeleton: list.isPending },
        focusRing
      )}
    >
      <span>{tag?.name ?? 'Loading'}</span>
      <X className="size-4" />
    </Link>
  );
}
