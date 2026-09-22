import { useMemo } from 'react';
import { Link, useParams } from 'react-router';
import { Check, Martini, Wine } from 'lucide-react';
import { z } from 'zod';

import type { CocktailDTO, IngredientDTO } from '@repo/dtos';
import { EditLink } from '~/components/catalog/action-links';
import { BackButton } from '~/components/catalog/back-button';
import { focusRing, ScreenFrame } from '~/components/catalog/common';
import { Photo } from '~/components/catalog/photo';
import { ErrorState } from '~/components/catalog/state';
import { TagChip } from '~/components/catalog/tag-chip';
import { useCocktailList } from '~/queries/cocktail';
import { useIngredient } from '~/queries/ingredient';
import { cn } from '~/utils/classnames';
import { formatAmount, pluralize, recipeItemNote } from '~/utils/recipe';
import { tagFullKey } from '~/utils/tags';

const Params = z.object({
  barId: z.string(),
  id: z.string(),
});

export function IngredientScreen() {
  const params = useParams();
  const { barId, id } = useMemo(() => Params.parse(params), [params]);

  const { isPending, error, data, refetch } = useIngredient(barId, id);

  return (
    <ScreenFrame className="z-200">
      <div className="mx-auto max-w-3xl md:px-6 md:pt-6">
        <div className="relative">
          <Photo
            image={data?.cardImage}
            alt={data?.name}
            Fallback={Wine}
            fit="contain"
            className={cn('aspect-[4/3] rounded-b-3xl md:rounded-3xl', { skeleton: isPending })}
          />
          <BackButton
            floating
            fallback={`/bar/${barId}/ingredients`}
            className="absolute left-3 top-[max(0.75rem,env(safe-area-inset-top))]"
          />
          {data && (
            <EditLink
              to={`/bar/${barId}/ingredients/${id}/edit`}
              label="Edit ingredient"
              className="absolute right-3 top-[max(0.75rem,env(safe-area-inset-top))]"
            />
          )}
        </div>

        <div className="px-4 pb-20 pt-6 md:px-0">
          {isPending && <DetailSkeleton />}
          {error && <ErrorState what="this ingredient" onRetry={() => refetch()} />}
          {data && <IngredientDetail barId={barId} ingredient={data} />}
        </div>
      </div>
    </ScreenFrame>
  );
}

type IngredientDetailProps = { barId: string; ingredient: IngredientDTO };
function IngredientDetail(props: IngredientDetailProps) {
  const { barId, ingredient } = props;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h1 className="font-serif text-4xl leading-none tracking-tight">{ingredient.name}</h1>
        <div>
          <Stock available={ingredient.available} />
        </div>
        {ingredient.tags.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {ingredient.tags.map((tag) => (
              <li key={tag.id}>
                <TagChip name={tag.name} to={`/bar/${barId}/ingredients?tag=${tagFullKey(tag)}`} />
              </li>
            ))}
          </ul>
        )}
        {ingredient.description && (
          <p className="max-w-prose font-serif text-lg leading-relaxed text-slate-700">{ingredient.description}</p>
        )}
      </div>

      <UsedIn barId={barId} ingredientId={ingredient.id} />
    </div>
  );
}

function Stock(props: { available: boolean }) {
  const { available } = props;

  return available ? (
    <span className="inline-flex items-center gap-2 rounded-full bg-slate-900 py-1.5 pl-3 pr-4 text-sm font-medium text-white">
      <Check className="size-4" strokeWidth={2.5} />
      In stock
    </span>
  ) : (
    <span className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-1.5 text-sm text-slate-600">
      Out of stock
    </span>
  );
}

type UsedInProps = { barId: string; ingredientId: string };

// Derived from the cocktail list, which already carries every recipe.
function UsedIn(props: UsedInProps) {
  const { barId, ingredientId } = props;
  const list = useCocktailList(barId);

  const uses = useMemo(
    () =>
      (list.data ?? [])
        .flatMap((cocktail) => {
          const item = cocktail.recipe.find((r) => r.ingredient.id === ingredientId);
          return item ? [{ cocktail, item }] : [];
        })
        .sort((a, b) => a.cocktail.name.localeCompare(b.cocktail.name)),
    [list.data, ingredientId]
  );

  return (
    <section aria-labelledby="used-in-heading" className="flex flex-col gap-2">
      <h2 id="used-in-heading" className="font-serif text-2xl tracking-tight">
        {list.isSuccess ? `Used in ${uses.length} ${pluralize(uses.length, 'cocktail')}` : 'Used in'}
      </h2>
      {list.isPending && (
        <div aria-hidden className="flex flex-col gap-2">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="skeleton h-16 w-full rounded-2xl" />
          ))}
        </div>
      )}
      {list.isError && <ErrorState what="cocktails" onRetry={() => list.refetch()} />}
      {list.isSuccess && uses.length === 0 && (
        <p className="text-sm text-slate-500">No cocktail in this bar uses it yet.</p>
      )}
      {list.isSuccess && uses.length > 0 && (
        <ul className="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {uses.map(({ cocktail, item }) => (
            <li key={cocktail.id}>
              <UseRow barId={barId} cocktail={cocktail} item={item} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

type UseRowProps = { barId: string; cocktail: CocktailDTO; item: CocktailDTO['recipe'][number] };
function UseRow(props: UseRowProps) {
  const { barId, cocktail, item } = props;
  const note = recipeItemNote(item);

  return (
    <Link
      to={`/bar/${barId}/cocktails/${cocktail.id}`}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-slate-50 active:bg-slate-100',
        focusRing,
        'focus-visible:ring-inset focus-visible:ring-offset-0'
      )}
    >
      <Photo image={cocktail.iconImage} Fallback={Martini} className="size-12 shrink-0 rounded-xl" />
      <span className="min-w-0 flex-1 truncate font-serif text-lg">{cocktail.name}</span>
      <span className="flex shrink-0 flex-col items-end text-sm">
        <span className="font-medium tabular-nums">{formatAmount(item)}</span>
        {note && <span className="text-slate-500">{note}</span>}
      </span>
    </Link>
  );
}

function DetailSkeleton() {
  return (
    <div aria-hidden className="flex flex-col gap-4">
      <div className="skeleton h-10 w-2/3" />
      <div className="skeleton h-8 w-28 rounded-full" />
      <div className="skeleton h-7 w-1/3 rounded-full" />
    </div>
  );
}
