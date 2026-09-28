import { useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';
import { Martini } from 'lucide-react';
import { z } from 'zod';

import { CocktailDTO } from '@repo/dtos';
import { cn } from '~/utils/classnames';
import { useCocktailList } from '~/queries/cocktail';
import { placeholders } from '~/data/placeholders';
import { pluralize } from '~/utils/locale';
import { ScreenFrame, focusRing } from '~/components/common';
import { BackButton } from '~/components/back-button';
import { NewLink } from '~/components/catalog/action-links';
import { Photo } from '~/components/catalog/photo';
import { TagSubtitle } from '~/components/catalog/tag-subtitle';
import { EmptyState, ErrorState } from '~/components/catalog/state-message';

const Params = z.object({ barId: z.string() });
const QueryParams = z.object({ tag: z.string().optional() });

export function CocktailListScreen() {
  const params = useParams();
  const { barId } = useMemo(() => Params.parse(params), [params]);
  const [query] = useSearchParams();
  const { tag } = useMemo(() => QueryParams.parse(Object.fromEntries(query.entries())), [query]);

  const list = useCocktailList(barId, { tag });
  const visible = useMemo(() => {
    if (list.isPending) return placeholders.cocktails.list;
    return list.data ?? [];
  }, [list.isPending, list.data]);

  return (
    <ScreenFrame className="z-100 border-l-8 border-slate-300 bg-slate-200">
      <header className="sticky top-0 z-10 border-slate-300/80 bg-slate-200/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 pb-3 pt-3">
          <div className="flex items-center gap-3">
            <BackButton fallback={`/bar/${barId}`} />
            <div className="-ml-2 flex flex-col">
              <h1 className={cn('font-serif text-3xl tracking-tight', { 'text-xl': !!tag })}>Cocktails</h1>
              {tag && <TagSubtitle barId={barId} tagKey={tag} />}
            </div>
            {list.data && (
              <span className="ml-auto text-sm text-slate-500">
                {list.data.length} {pluralize(list.data.length, 'drink')}
              </span>
            )}
            <NewLink to={`/bar/${barId}/cocktails/new`} label="New cocktail" className={list.data ? '' : 'ml-auto'} />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 pb-4 pt-2">
        {list.isError && <ErrorState what="cocktails" onRetry={() => list.refetch()} />}
        {list.isSuccess && visible.length === 0 && (
          <EmptyState title="No cocktails here yet">Cocktails added to this bar will show up here.</EmptyState>
        )}
        {visible.length > 0 && (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {visible.map((cocktail) => (
              <li key={cocktail.id} className="rounded-lg">
                <CocktailCard barId={barId} cocktail={cocktail} isPending={list.isPending} />
              </li>
            ))}
          </ul>
        )}
      </main>
    </ScreenFrame>
  );
}

type CocktailCardProps = {
  barId: string;
  cocktail: CocktailDTO;
  isPending?: boolean;
};
export function CocktailCard(props: CocktailCardProps) {
  const { barId, cocktail, isPending: skeleton } = props;

  return (
    <Link
      to={`/bar/${barId}/cocktails/${cocktail.id}`}
      className={cn('aspect-3/4 relative flex rounded-lg text-left outline-none', focusRing, { skeleton })}
    >
      <Photo
        className={cn(
          'aspect-3/4 rounded-lg bg-transparent bg-cover bg-no-repeat transition-transform group-active:scale-[0.98]'
        )}
        image={cocktail.cardImage}
        fallback={Martini}
      />
      <div className="bg-linear-to-b absolute bottom-0 left-0 right-0 rounded-bl-lg rounded-br-lg from-transparent to-black/50 px-3 pb-2 pt-6 font-medium text-white transition-transform group-active:scale-[0.98]">
        {cocktail.name}
      </div>
    </Link>
  );
}
