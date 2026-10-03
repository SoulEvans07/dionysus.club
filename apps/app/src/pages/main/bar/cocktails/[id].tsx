import { useMemo } from 'react';
import { Link, useParams } from 'react-router';
import { Check, Martini, BottleWine } from 'lucide-react';
import { z } from 'zod';

import { CocktailDTO } from '@repo/dtos';
import { cn } from '~/utils/classnames';
import { tagFullKey } from '~/utils/tags';
import { formatAmount, missingIngredients, recipeItemNote } from '~/utils/recipe';
import { useSettings } from '~/stores/settings';
import { pluralize } from '~/utils/locale';
import { useCocktail } from '~/queries/cocktail';
import { placeholders } from '~/data/placeholders';
import { focusRing, ScreenFrame } from '~/components/common';
import { ErrorState } from '~/components/catalog/state-message';
import { Photo } from '~/components/catalog/photo';
import { BackButton } from '~/components/back-button';
import { EditLink } from '~/components/catalog/action-buttons';
import { TagChip } from '~/components/catalog/tag-chip';

const Params = z.object({
  barId: z.string(),
  id: z.string(),
});

export function CocktailScreen() {
  const params = useParams();
  const { barId, id } = useMemo(() => Params.parse(params), [params]);

  const { isPending, error, data, refetch } = useCocktail(barId, id);
  const cocktail = isPending ? placeholders.cocktails.single : data;

  return (
    <ScreenFrame className="z-200 bg-slate-100 dark:bg-slate-950">
      <div className="mx-auto grid max-w-5xl md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:gap-10 md:px-6 md:py-6">
        <div className="relative md:sticky md:top-6 md:self-start">
          <Photo
            image={cocktail?.cardImage}
            alt={cocktail?.name}
            fallback={Martini}
            className={cn('aspect-5/4 md:aspect-square md:rounded-3xl')}
          />
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
          {error && <ErrorState what="this cocktail" onRetry={() => refetch()} />}
          {cocktail && <CocktailDetail barId={barId} cocktail={cocktail} isPending={isPending} />}
        </div>
      </div>
    </ScreenFrame>
  );
}

type CocktailDetailProps = {
  barId: string;
  cocktail: CocktailDTO;
  isPending?: boolean;
};
function CocktailDetail(props: CocktailDetailProps) {
  const { barId, cocktail, isPending: skeleton } = props;
  const missing = missingIngredients(cocktail);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h1 className={cn('rounded-md font-serif text-4xl leading-none tracking-tight', { skeleton })}>
          {cocktail.name}
        </h1>
        {cocktail.tags.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {cocktail.tags.map((tag) => (
              <li key={tag.id}>
                <TagChip
                  className={cn({ skeleton })}
                  tag={tag}
                  to={`/bar/${barId}/cocktails?tag=${tagFullKey(tag)}`}
                ></TagChip>
              </li>
            ))}
          </ul>
        )}
        {cocktail.description && (
          <p
            className={cn(
              'max-w-prose rounded-md font-serif text-lg leading-relaxed text-slate-700 dark:text-slate-300',
              { skeleton }
            )}
          >
            {cocktail.description}
          </p>
        )}
      </div>

      {cocktail.recipe.length > 0 && <Availability missing={missing} skeleton={skeleton} />}

      <section aria-labelledby="recipe-heading" className="flex flex-col gap-1">
        <h2 id="recipe-heading" className="font-serif text-2xl tracking-tight">
          Recipe
        </h2>
        {cocktail.recipe.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No ingredients added yet.</p>
        ) : (
          <ul className="flex flex-col">
            {cocktail.recipe.map((item) => (
              <RecipeLine key={item.ingredient.id} barId={barId} item={item} skeleton={skeleton} />
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
            {cocktail.steps.map((step) => (
              <RecipeStep key={step.index} step={step} skeleton={skeleton} />
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}

type AvailabilityProps = {
  missing: { id: string; name: string }[];
  skeleton?: boolean;
};
function Availability(props: AvailabilityProps) {
  const { missing, skeleton } = props;

  if (missing.length === 0) {
    return (
      <div
        className={cn(
          'flex items-center gap-3 rounded-2xl bg-slate-900 px-4 py-3 text-white dark:bg-slate-100 dark:text-slate-900',
          { skeleton }
        )}
      >
        <Check className="size-5 shrink-0" strokeWidth={2.5} />
        <p className="font-medium">You have everything for this one</p>
      </div>
    );
  }

  return (
    <div className={cn('rounded-2xl border border-slate-300 px-4 py-3 dark:border-slate-700', { skeleton })}>
      <p className="font-medium">
        Missing {missing.length} {pluralize(missing.length, 'ingredient')}
      </p>
      <p className="text-sm text-slate-600 dark:text-slate-400">{missing.map((m) => m.name).join(', ')}</p>
    </div>
  );
}

type RecipeLineProps = {
  barId: string;
  item: CocktailDTO['recipe'][number];
  skeleton?: boolean;
};
function RecipeLine(props: RecipeLineProps) {
  const { barId, item, skeleton } = props;
  const { ingredient } = item;
  const volumeUnit = useSettings((state) => state.volumeUnit);
  const notes = [recipeItemNote(item), ingredient.available ? null : 'Out of stock'].filter(Boolean).join(', ');

  return (
    <li>
      <Link
        to={`/bar/${barId}/ingredients/${ingredient.id}`}
        className={cn(
          '-mx-2 flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-slate-200/60 dark:hover:bg-slate-800/60',
          focusRing
        )}
      >
        <Photo
          image={ingredient.iconImage}
          fallback={BottleWine}
          fit="contain"
          dim={!ingredient.available}
          className={cn('size-11 shrink-0 rounded-lg')}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-baseline gap-2">
            <span className={cn('rounded-md font-medium', { skeleton })}>{ingredient.name}</span>
            <span
              aria-hidden
              className="min-w-4 flex-1 border-b-2 border-dotted border-slate-300 dark:border-slate-700"
            />
            <span className={cn('whitespace-nowrap rounded-md font-medium tabular-nums', { skeleton })}>
              {formatAmount(item, volumeUnit)}
            </span>
          </div>
          {notes && <span className="text-sm text-slate-500 dark:text-slate-400">{notes}</span>}
        </div>
      </Link>
    </li>
  );
}

type RecipeStepProps = {
  step: CocktailDTO['steps'][number];
  skeleton?: boolean;
};
function RecipeStep(props: RecipeStepProps) {
  const { step, skeleton } = props;

  return (
    <li key={step.index} className="flex gap-4">
      <span
        aria-hidden
        className="w-6 shrink-0 text-right font-serif text-2xl leading-tight text-slate-400 dark:text-slate-500"
      >
        {step.index + 1}.
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <p className={cn('max-w-prose rounded-md leading-relaxed', { skeleton })}>{step.description}</p>
        {step.image && <Photo image={step.image} fallback={Martini} className="aspect-4/3 w-full rounded-2xl" />}
      </div>
    </li>
  );
}
