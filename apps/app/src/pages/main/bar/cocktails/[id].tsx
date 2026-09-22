import { useMemo } from 'react';
import { Link, useParams } from 'react-router';
import { Check, Martini, Wine } from 'lucide-react';
import { z } from 'zod';

import type { CocktailDTO } from '@repo/dtos';
import { EditLink } from '~/components/catalog/action-links';
import { BackButton } from '~/components/catalog/back-button';
import { focusRing, ScreenFrame } from '~/components/catalog/common';
import { Photo } from '~/components/catalog/photo';
import { ErrorState } from '~/components/catalog/state';
import { TagChip } from '~/components/catalog/tag-chip';
import { useCocktail } from '~/queries/cocktail';
import { cn } from '~/utils/classnames';
import { formatAmount, missingIngredients, pluralize, recipeItemNote } from '~/utils/recipe';
import { tagFullKey } from '~/utils/tags';

const Params = z.object({
  barId: z.string(),
  id: z.string(),
});

export function CocktailScreen() {
  const params = useParams();
  const { barId, id } = useMemo(() => Params.parse(params), [params]);

  const { isPending, error, data, refetch } = useCocktail(barId, id);

  return (
    <ScreenFrame className="z-200">
      <div className="mx-auto grid max-w-5xl md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:gap-10 md:px-6 md:py-6">
        <div className="relative md:sticky md:top-6 md:self-start">
          {data ? (
            <Photo
              image={data.cardImage}
              alt={data.name}
              Fallback={Martini}
              className="aspect-[5/4] rounded-b-3xl md:aspect-square md:rounded-3xl"
            />
          ) : (
            <div
              className={cn('aspect-[5/4] rounded-b-3xl bg-slate-200 md:aspect-square md:rounded-3xl', {
                skeleton: isPending,
              })}
            />
          )}
          <BackButton
            floating
            fallback={`/bar/${barId}/cocktails`}
            className="absolute left-3 top-[max(0.75rem,env(safe-area-inset-top))]"
          />
          {data && (
            <EditLink
              to={`/bar/${barId}/cocktails/${id}/edit`}
              label="Edit cocktail"
              className="absolute right-3 top-[max(0.75rem,env(safe-area-inset-top))]"
            />
          )}
        </div>

        <div className="px-4 pb-20 pt-6 md:px-0 md:pt-2">
          {isPending && <DetailSkeleton />}
          {error && <ErrorState what="this cocktail" onRetry={() => refetch()} />}
          {data && <CocktailDetail barId={barId} cocktail={data} />}
        </div>
      </div>
    </ScreenFrame>
  );
}

type CocktailDetailProps = { barId: string; cocktail: CocktailDTO };
function CocktailDetail(props: CocktailDetailProps) {
  const { barId, cocktail } = props;
  const missing = missingIngredients(cocktail);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h1 className="font-serif text-4xl leading-none tracking-tight">{cocktail.name}</h1>
        {cocktail.tags.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {cocktail.tags.map((tag) => (
              <li key={tag.id}>
                <TagChip name={tag.name} to={`/bar/${barId}/cocktails?tag=${tagFullKey(tag)}`} />
              </li>
            ))}
          </ul>
        )}
        {cocktail.description && (
          <p className="max-w-prose font-serif text-lg leading-relaxed text-slate-700">{cocktail.description}</p>
        )}
      </div>

      {cocktail.recipe.length > 0 && <Availability missing={missing} />}

      <section aria-labelledby="recipe-heading" className="flex flex-col gap-1">
        <h2 id="recipe-heading" className="font-serif text-2xl tracking-tight">
          Recipe
        </h2>
        {cocktail.recipe.length === 0 ? (
          <p className="text-sm text-slate-500">No ingredients added yet.</p>
        ) : (
          <ul className="flex flex-col">
            {cocktail.recipe.map((item) => (
              <RecipeLine key={item.ingredient.id} barId={barId} item={item} />
            ))}
          </ul>
        )}
      </section>

      {cocktail.steps.length > 0 && (
        <section aria-labelledby="method-heading" className="flex flex-col gap-3">
          <h2 id="method-heading" className="font-serif text-2xl tracking-tight">
            Method
          </h2>
          <ol className="flex flex-col gap-5">
            {cocktail.steps.map((step, i) => (
              <li key={step.index} className="flex gap-4">
                <span aria-hidden className="w-6 shrink-0 text-right font-serif text-2xl leading-tight text-slate-400">
                  {i + 1}
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-3">
                  <p className="max-w-prose leading-relaxed">{step.description}</p>
                  {step.image && (
                    <Photo image={step.image} Fallback={Martini} className="aspect-[4/3] w-full rounded-2xl" />
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}

function Availability(props: { missing: { id: string; name: string }[] }) {
  const { missing } = props;

  if (missing.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-slate-900 px-4 py-3 text-white">
        <Check className="size-5 shrink-0" strokeWidth={2.5} />
        <p className="font-medium">You have everything for this one</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-300 px-4 py-3">
      <p className="font-medium">
        Missing {missing.length} {pluralize(missing.length, 'ingredient')}
      </p>
      <p className="text-sm text-slate-600">{missing.map((m) => m.name).join(', ')}</p>
    </div>
  );
}

type RecipeLineProps = { barId: string; item: CocktailDTO['recipe'][number] };

// Reads like a printed menu: name, dotted leader, amount.
function RecipeLine(props: RecipeLineProps) {
  const { barId, item } = props;
  const { ingredient } = item;
  const notes = [recipeItemNote(item), ingredient.available ? null : 'Out of stock'].filter(Boolean).join(', ');

  return (
    <li>
      <Link
        to={`/bar/${barId}/ingredients/${ingredient.id}`}
        className={cn('-mx-2 flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-slate-200/60', focusRing)}
      >
        <Photo
          image={ingredient.iconImage}
          Fallback={Wine}
          fit="contain"
          dim={!ingredient.available}
          className="size-11 shrink-0 rounded-xl"
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-baseline gap-2">
            <span className="font-medium">{ingredient.name}</span>
            <span aria-hidden className="min-w-4 flex-1 border-b-2 border-dotted border-slate-300" />
            <span className="whitespace-nowrap font-medium tabular-nums">{formatAmount(item)}</span>
          </div>
          {notes && <span className="text-sm text-slate-500">{notes}</span>}
        </div>
      </Link>
    </li>
  );
}

function DetailSkeleton() {
  return (
    <div aria-hidden className="flex flex-col gap-4">
      <div className="skeleton h-10 w-2/3" />
      <div className="skeleton h-7 w-1/3 rounded-full" />
      <div className="skeleton mt-4 h-8 w-24" />
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="skeleton h-11 w-full rounded-xl" />
      ))}
    </div>
  );
}
