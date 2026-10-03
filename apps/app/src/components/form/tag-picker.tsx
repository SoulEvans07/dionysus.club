import { useMemo } from 'react';
import { Check } from 'lucide-react';

import { TOP_LEVEL_TAG_NAMESPACE, type TagDTO } from '@repo/dtos';
import { cn } from '~/utils/classnames';
import { focusRing } from '~/components/common';
import { tagFullKeyUI } from '~/utils/tags';

type TagPickerProps = {
  tags: TagDTO[];
  value: string[];
  onChange: (ids: string[]) => void;
  isPending?: boolean;
};
export function TagPicker(props: TagPickerProps) {
  const { tags, value, onChange, isPending } = props;

  const groups = useMemo(() => {
    const byNamespace = new Map<string, TagDTO[]>();
    for (const tag of tags) byNamespace.set(tag.namespace, [...(byNamespace.get(tag.namespace) ?? []), tag]);
    return [...byNamespace.entries()];
  }, [tags]);

  const toggle = (id: string) => onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);

  if (isPending) return <div aria-hidden className="skeleton h-24 w-full rounded-2xl" />;
  if (groups.length === 0)
    return <p className="text-sm text-slate-500 dark:text-slate-400">No tags to choose from yet.</p>;

  return (
    <div className="flex flex-col gap-3">
      {groups.map(([namespace, group]) => (
        <div key={namespace} className="flex flex-col gap-1.5 sm:flex-row sm:gap-3">
          {namespace !== TOP_LEVEL_TAG_NAMESPACE && (
            <span className="w-20 shrink-0 pt-1.5 text-sm text-slate-500 dark:text-slate-400">{namespace}</span>
          )}
          <ul className="flex flex-wrap gap-2">
            {group.map((tag) => {
              const selected = value.includes(tag.id);
              return (
                <li key={tag.id}>
                  <button
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggle(tag.id)}
                    className={cn(
                      'flex h-9 items-center gap-1.5 rounded-full border px-3 text-sm transition-colors',
                      selected
                        ? 'border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-700',
                      focusRing
                    )}
                  >
                    {selected && <Check className="size-3.5" strokeWidth={3} />}
                    {tag.name}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
