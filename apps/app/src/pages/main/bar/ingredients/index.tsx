import { useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';
import { Wine } from 'lucide-react';
import { z } from 'zod';

import type { IngredientDTO } from '@repo/dtos';
import { NewLink } from '~/components/catalog/action-links';
import { BackButton } from '~/components/catalog/back-button';
import { focusRing, ScreenFrame } from '~/components/catalog/common';
import { SearchField, Segmented, TagFilter } from '~/components/catalog/filters';
import { Photo } from '~/components/catalog/photo';
import { EmptyState, ErrorState } from '~/components/catalog/state';
import { Switch } from '~/components/shadcn/switch';
import { useIngredientList, useSetIngredientAvailability } from '~/queries/ingredient';
import { cn } from '~/utils/classnames';
import { pluralize } from '~/utils/recipe';

const Params = z.object({ barId: z.string() });
const QueryParams = z.object({ tag: z.string().optional() });

type Mode = 'all' | 'in-stock';
const modes: { value: Mode; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'in-stock', label: 'In stock' },
];

export function IngredientListScreen() {
  const params = useParams();
  const { barId } = useMemo(() => Params.parse(params), [params]);
  const [query] = useSearchParams();
  const { tag } = useMemo(() => QueryParams.parse(Object.fromEntries(query.entries())), [query]);

  const [search, setSearch] = useState('');
  const [mode, setMode] = useState<Mode>('all');

  const list = useIngredientList(barId, { tag });

  const visible = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return (list.data ?? [])
      .filter((i) => (needle ? i.name.toLowerCase().includes(needle) : true))
      .filter((i) => (mode === 'in-stock' ? i.available : true))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [list.data, search, mode]);

  const groups = useMemo(() => groupByLetter(visible), [visible]);

  const isFiltered = search.trim() !== '' || mode !== 'all';
  const clearFilters = () => {
    setSearch('');
    setMode('all');
  };

  return (
    <ScreenFrame className="z-100">
      <header className="sticky top-0 z-10 bg-slate-100/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl flex-col gap-3 px-4 pb-3 pt-3">
          <div className="flex items-center gap-3">
            <BackButton fallback={`/bar/${barId}`} />
            <h1 className="font-serif text-3xl tracking-tight">Ingredients</h1>
            {list.data && (
              <span className="ml-auto text-sm text-slate-500">
                {visible.length} {pluralize(visible.length, 'item')}
              </span>
            )}
            <NewLink
              to={`/bar/${barId}/ingredients/new`}
              label="New ingredient"
              className={list.data ? '' : 'ml-auto'}
            />
          </div>
          {tag && <TagFilter barId={barId} tagKey={tag} clearTo={`/bar/${barId}/ingredients`} />}
          <div className="flex items-center gap-2">
            <SearchField label="Search ingredients" value={search} onChange={setSearch} />
            <Segmented label="Show" value={mode} options={modes} onChange={setMode} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-16 pt-2">
        {list.isPending && <ListSkeleton />}
        {list.isError && <ErrorState what="ingredients" onRetry={() => list.refetch()} />}
        {list.isSuccess && visible.length === 0 && (
          <NothingToShow isFiltered={isFiltered} mode={mode} onClear={clearFilters} />
        )}
        {list.isSuccess && visible.length > 0 && (
          <div className="flex flex-col gap-5">
            {groups.map(([letter, items]) => (
              <section key={letter} aria-label={letter} className="flex flex-col gap-1.5">
                <h2 aria-hidden className="px-1 font-serif text-xl leading-none text-slate-400">
                  {letter}
                </h2>
                <ul className="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  {items.map((ingredient) => (
                    <li key={ingredient.id}>
                      <IngredientRow barId={barId} ingredient={ingredient} />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </main>
    </ScreenFrame>
  );
}

function groupByLetter(items: IngredientDTO[]) {
  const groups = new Map<string, IngredientDTO[]>();
  for (const item of items) {
    const letter = item.name.trim().charAt(0).toUpperCase() || '#';
    groups.set(letter, [...(groups.get(letter) ?? []), item]);
  }
  return [...groups.entries()];
}

type IngredientRowProps = { barId: string; ingredient: IngredientDTO };
function IngredientRow(props: IngredientRowProps) {
  const { barId, ingredient } = props;
  const detail = ingredient.description || ingredient.tags.map((t) => t.name).join(', ');

  const setAvailability = useSetIngredientAvailability(barId);

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-slate-50 active:bg-slate-100">
      <Link
        to={`/bar/${barId}/ingredients/${ingredient.id}`}
        className={cn(
          'flex min-w-0 flex-1 items-center gap-3',
          focusRing,
          'focus-visible:ring-inset focus-visible:ring-offset-0'
        )}
      >
        <Photo
          image={ingredient.iconImage}
          Fallback={Wine}
          fit="contain"
          dim={!ingredient.available}
          className="size-12 shrink-0 rounded-xl border border-slate-100"
        />
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium">{ingredient.name}</div>
          {detail && <div className="truncate text-sm text-slate-500">{detail}</div>}
        </div>
      </Link>
      <Switch
        checked={ingredient.available}
        disabled={setAvailability.isPending}
        onCheckedChange={(available) => setAvailability.mutate({ id: ingredient.id, available })}
        aria-label={`Mark ${ingredient.name} as ${ingredient.available ? 'out of stock' : 'in stock'}`}
      />
    </div>
  );
}

type NothingToShowProps = { isFiltered: boolean; mode: Mode; onClear: () => void };
function NothingToShow(props: NothingToShowProps) {
  const { isFiltered, mode, onClear } = props;

  if (mode === 'in-stock') {
    return (
      <EmptyState title="Nothing in stock" action={{ label: 'Show all ingredients', onClick: onClear }}>
        Ingredients you mark as in stock will show up here.
      </EmptyState>
    );
  }
  if (isFiltered) {
    return (
      <EmptyState title="No ingredients match" action={{ label: 'Clear search', onClick: onClear }}>
        Try a different name.
      </EmptyState>
    );
  }
  return <EmptyState title="No ingredients here yet">Ingredients added to this bar will show up here.</EmptyState>;
}

function ListSkeleton() {
  return (
    <div aria-hidden className="flex flex-col gap-1.5">
      <div className="skeleton h-5 w-6" />
      <ul className="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {Array.from({ length: 6 }, (_, i) => (
          <li key={i} className="flex items-center gap-3 px-3 py-2.5">
            <div className="skeleton size-12 rounded-xl" />
            <div className="skeleton h-5 w-1/2" />
          </li>
        ))}
      </ul>
    </div>
  );
}
