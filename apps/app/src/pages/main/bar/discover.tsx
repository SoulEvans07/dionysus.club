import { useState } from 'react';
import { Users } from 'lucide-react';
import { useDebounce } from '@uidotdev/usehooks';

import type { DiscoverBarDTO } from '@repo/dtos';
import { useBarDiscovery } from '~/queries/bar';
import { ScreenFrame } from '~/components/common';
import { BackButton } from '~/components/back-button';
import { SearchField } from '~/components/catalog/filters';
import { EmptyState, ErrorState } from '~/components/catalog/state-message';
import { Spinner } from '~/components/shadcn/spinner';

const SEARCH_DEBOUNCE_MS = 300;
const SKELETON_COUNT = 4;

export function BarDiscoverScreen() {
  const [searchText, setSearchText] = useState('');
  const clearSearch = () => setSearchText('');
  const q = useDebounce(searchText.trim(), SEARCH_DEBOUNCE_MS);

  const list = useBarDiscovery(q ? { q } : undefined);

  return (
    <ScreenFrame className="z-100 bg-slate-200 dark:bg-slate-950">
      <header className="sticky top-0 z-10 bg-slate-200/80 backdrop-blur dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 pb-3 pt-3">
          <div className="flex items-center gap-3">
            <BackButton fallback="/bar" />
            <div className="-ml-2 mr-auto flex flex-col">
              <h1 className="font-serif text-3xl tracking-tight">Discover</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Public bars you can join</p>
            </div>
            {list.isFetching && !list.isPending && <Spinner className="size-4 opacity-80" />}
          </div>
          <SearchField label="Search bars" value={searchText} onChange={setSearchText} onClear={clearSearch} />
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 pb-24 pt-2">
        {list.isError && <ErrorState what="bars" onRetry={() => list.refetch()} />}
        {list.isSuccess && list.data.length === 0 && (
          <EmptyState title={q ? 'No bars match your search' : 'Nothing to discover yet'}>
            {q ? 'Try a different name.' : 'Public bars you can join will show up here.'}
          </EmptyState>
        )}
        {(list.isPending || (list.isSuccess && list.data.length > 0)) && (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {list.isPending
              ? Array.from({ length: SKELETON_COUNT }, (_, i) => (
                  <li key={i}>
                    <BarCardSkeleton />
                  </li>
                ))
              : list.data.map((bar) => (
                  <li key={bar.id}>
                    <BarCard bar={bar} />
                  </li>
                ))}
          </ul>
        )}
      </main>
    </ScreenFrame>
  );
}

type BarCardProps = { bar: DiscoverBarDTO };
function BarCard(props: BarCardProps) {
  const { bar } = props;
  const banner = bar.bannerImage ? { backgroundImage: `url(${bar.bannerImage.url})` } : {};

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900">
      <div
        className="bg-linear-to-t aspect-5/2 from-slate-500 to-slate-50 bg-cover bg-center dark:from-slate-600 dark:to-slate-800"
        style={banner}
      />
      <div className="flex flex-1 flex-col gap-3 p-3">
        <div className="flex items-start gap-3">
          <BarLogo bar={bar} />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <h2 className="truncate font-medium">{bar.name}</h2>
            {bar.slogan && <p className="truncate text-sm text-slate-500 dark:text-slate-400">{bar.slogan}</p>}
          </div>
        </div>
        {bar.description && (
          <p className="line-clamp-2 text-sm text-slate-600 dark:text-slate-300">{bar.description}</p>
        )}
        <div className="mt-auto flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
          <Users className="size-4" />
          <span>
            {bar.memberCount} {bar.memberCount === 1 ? 'member' : 'members'}
          </span>
        </div>
      </div>
    </article>
  );
}

function BarLogo(props: BarCardProps) {
  const { bar } = props;

  return (
    <div className="-mt-9 grid size-14 shrink-0 place-items-center overflow-hidden rounded-xl border-4 border-slate-100 bg-slate-800 text-slate-300 dark:border-slate-900 dark:bg-slate-700">
      {bar.logoImage ? (
        <img src={bar.logoImage.url} alt="" draggable={false} className="size-full object-cover" />
      ) : (
        <span className="text-2xl font-semibold">{bar.name[0].toUpperCase()}</span>
      )}
    </div>
  );
}

function BarCardSkeleton() {
  return (
    <div
      aria-hidden
      className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="skeleton aspect-5/2 rounded-none" />
      <div className="flex flex-col gap-3 p-3">
        <div className="skeleton h-5 w-2/3 rounded-md" />
        <div className="skeleton h-4 w-1/3 rounded-md" />
      </div>
    </div>
  );
}
