import { useMemo } from 'react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router';
import { Martini } from 'lucide-react';
import { z } from 'zod';

import { CocktailDTO } from '@repo/dtos';
import { cn } from '~/utils/classnames';
import { useCocktailList } from '~/queries/cocktail';
import { focusWithinRing, ScreenFrame } from '~/components/common';
import { BackButton } from '~/components/back-button';
import { pluralize } from '~/utils/locale';
import { NewLink } from '~/components/catalog/action-links';
import { useTagList } from '~/queries/tag';
import { tagFullKey } from '~/utils/tags';
import { Photo } from '~/components/catalog/photo';

const Params = z.object({ barId: z.string() });
const QueryParams = z.object({ tag: z.string().optional() });

export function CocktailListScreen() {
  const params = useParams();
  const { barId } = useMemo(() => Params.parse(params), [params]);
  const [query] = useSearchParams();
  const { tag } = useMemo(() => QueryParams.parse(Object.fromEntries(query.entries())), [query]);

  const list = useCocktailList(barId, { tag });

  if (list.isPending) return <ScreenFrame className="z-100">Loading...</ScreenFrame>;
  if (list.error) return <ScreenFrame className="z-100">Error</ScreenFrame>;

  return (
    <ScreenFrame className="z-100">
      <header className="sticky top-0 z-10 bg-slate-300/80 backdrop-blur">
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
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {list.data.map((cocktail) => (
            <li key={cocktail.id} className={cn('rounded-lg', focusWithinRing)}>
              <CocktailCard barId={barId} cocktail={cocktail} />
            </li>
          ))}
        </ul>
      </main>
    </ScreenFrame>
  );
}

type TagSubtitleProps = { barId: string; tagKey: string };
function TagSubtitle(props: TagSubtitleProps) {
  const { barId, tagKey } = props;

  const list = useTagList(barId);
  const tag = useMemo(() => list.data?.find((t) => tagFullKey(t) === tagKey), [list.data, tagKey]);
  if (list.isSuccess && tag === undefined) return <Navigate to={`/bar/${barId}`} replace />;

  return <h2 className={cn('-mt-1! rounded-md text-xs', { skeleton: list.isPending })}>{tag?.name ?? 'Loading'}</h2>;
}

type CocktailCardProps = {
  barId: string;
  cocktail: CocktailDTO;
};
export function CocktailCard(props: CocktailCardProps) {
  const { barId, cocktail } = props;

  return (
    <Link
      to={`/bar/${barId}/cocktails/${cocktail.id}`}
      className={cn('aspect-3/4 relative rounded-lg text-left outline-none')}
    >
      <Photo
        className="aspect-3/4 rounded-lg bg-cover bg-no-repeat transition-transform group-active:scale-[0.98]"
        image={cocktail.cardImage}
        fallback={Martini}
      />
      <div className="bg-linear-to-b absolute bottom-0 left-0 right-0 rounded-bl-lg rounded-br-lg from-transparent to-black/50 px-3 pb-2 pt-6 font-medium text-white transition-transform group-active:scale-[0.98]">
        {cocktail.name}
      </div>
    </Link>
  );
}
