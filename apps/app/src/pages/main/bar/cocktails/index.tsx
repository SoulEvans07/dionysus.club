import { useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';
import { Check, Martini } from 'lucide-react';
import { z } from 'zod';

import type { CocktailDTO } from '@repo/dtos';
import { NewLink } from '~/components/catalog/action-links';
import { BackButton } from '~/components/catalog/back-button';
import { focusRing, ScreenFrame } from '~/components/catalog/common';
import { SearchField, Segmented, TagFilter } from '~/components/catalog/filters';
import { Photo } from '~/components/catalog/photo';
import { EmptyState, ErrorState } from '~/components/catalog/state';
import { useCocktailList } from '~/queries/cocktail';
import { canMake, pluralize, recipeSummary } from '~/utils/recipe';

const Params = z.object({ barId: z.string() });
const QueryParams = z.object({ tag: z.string().optional() });

type Mode = 'all' | 'ready';
const modes: { value: Mode; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'ready', label: 'Can make' },
];

export function CocktailListScreen() {
  const params = useParams();
  const { barId } = useMemo(() => Params.parse(params), [params]);
  const [query] = useSearchParams();
  const { tag } = useMemo(() => QueryParams.parse(Object.fromEntries(query.entries())), [query]);

  const [search, setSearch] = useState('');
  const [mode, setMode] = useState<Mode>('all');

  const list = useCocktailList(barId, { tag });

  const visible = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return (list.data ?? [])
      .filter((c) => (needle ? c.name.toLowerCase().includes(needle) : true))
      .filter((c) => (mode === 'ready' ? canMake(c) : true))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [list.data, search, mode]);

  const isFiltered = search.trim() !== '' || mode !== 'all';
  const clearFilters = () => {
    setSearch('');
    setMode('all');
  };

  return (
    <ScreenFrame className="z-100">
      <header className="sticky top-0 z-10 bg-slate-100/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 pb-3 pt-3">
          <div className="flex items-center gap-3">
            <BackButton fallback={`/bar/${barId}`} />
            <h1 className="font-serif text-3xl tracking-tight">Cocktails</h1>
            {list.data && (
              <span className="ml-auto text-sm text-slate-500">
                {visible.length} {pluralize(visible.length, 'drink')}
              </span>
            )}
            <NewLink to={`/bar/${barId}/cocktails/new`} label="New cocktail" className={list.data ? '' : 'ml-auto'} />
          </div>
          {tag && <TagFilter barId={barId} tagKey={tag} clearTo={`/bar/${barId}/cocktails`} />}
          <div className="flex items-center gap-2">
            <SearchField label="Search cocktails" value={search} onChange={setSearch} />
            <Segmented label="Show" value={mode} options={modes} onChange={setMode} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-16 pt-2">
        {list.isPending && <GridSkeleton />}
        {list.isError && <ErrorState what="cocktails" onRetry={() => list.refetch()} />}
        {list.isSuccess && visible.length === 0 && (
          <NothingToShow isFiltered={isFiltered} mode={mode} onClear={clearFilters} />
        )}
        {list.isSuccess && visible.length > 0 && (
          <ul className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
            {visible.map((cocktail) => (
              <li key={cocktail.id}>
                <CocktailCard barId={barId} cocktail={cocktail} />
              </li>
            ))}
          </ul>
        )}
      </main>
    </ScreenFrame>
  );
}

type CocktailCardProps = { barId: string; cocktail: CocktailDTO };
function CocktailCard(props: CocktailCardProps) {
  const { barId, cocktail } = props;
  const ready = canMake(cocktail);

  return (
    <Link
      to={`/bar/${barId}/cocktails/${cocktail.id}`}
      className={`group flex flex-col gap-2 rounded-2xl ${focusRing}`}
    >
      <div className="relative">
        <Photo
          image={cocktail.cardImage}
          Fallback={Martini}
          className="aspect-square rounded-2xl transition-transform group-active:scale-[0.98]"
        />
        {ready && (
          <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-slate-900 py-0.5 pl-1.5 pr-2 text-xs font-medium text-white">
            <Check className="size-3" strokeWidth={3} />
            Ready
          </span>
        )}
      </div>
      <div className="min-w-0 px-0.5">
        <h2 className="truncate font-serif text-lg leading-tight">{cocktail.name}</h2>
        <p className="line-clamp-2 text-sm text-slate-500">{recipeSummary(cocktail)}</p>
      </div>
    </Link>
  );
}

type NothingToShowProps = { isFiltered: boolean; mode: Mode; onClear: () => void };
function NothingToShow(props: NothingToShowProps) {
  const { isFiltered, mode, onClear } = props;

  if (mode === 'ready') {
    return (
      <EmptyState title="Nothing you can make yet" action={{ label: 'Show all cocktails', onClick: onClear }}>
        Cocktails appear here once every required ingredient is in stock.
      </EmptyState>
    );
  }
  if (isFiltered) {
    return (
      <EmptyState title="No cocktails match" action={{ label: 'Clear search', onClick: onClear }}>
        Try a different name.
      </EmptyState>
    );
  }
  return <EmptyState title="No cocktails here yet">Cocktails added to this bar will show up here.</EmptyState>;
}

function GridSkeleton() {
  return (
    <ul aria-hidden className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }, (_, i) => (
        <li key={i} className="flex flex-col gap-2">
          <div className="skeleton aspect-square rounded-2xl" />
          <div className="skeleton h-5 w-2/3" />
          <div className="skeleton h-4 w-full" />
        </li>
      ))}
    </ul>
  );
}
