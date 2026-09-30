import { useMemo } from 'react';
import { Link, useParams } from 'react-router';
import { type LucideIcon, BottleWine, Check, CircleOff, Martini } from 'lucide-react';
import { z } from 'zod';

import { CocktailDTO, IngredientDTO } from '@repo/dtos';
import { cn } from '~/utils/classnames';
import { tagFullKey } from '~/utils/tags';
import { pluralize } from '~/utils/locale';
import { useIngredient } from '~/queries/ingredient';
import { placeholders } from '~/data/placeholders';
import { focusRing, ScreenFrame } from '~/components/common';
import { ErrorState } from '~/components/catalog/state-message';
import { Photo } from '~/components/catalog/photo';
import { BackButton } from '~/components/back-button';
import { EditLink } from '~/components/catalog/action-links';
import { TagChip } from '~/components/catalog/tag-chip';
import { useCocktailList } from '~/queries/cocktail';
import { formatAmount, recipeItemNote } from '~/utils/recipe';

const Params = z.object({
  barId: z.string(),
  id: z.string(),
});

export function IngredientScreen() {
  const params = useParams();
  const { barId, id } = useMemo(() => Params.parse(params), [params]);

  const { isPending, error, data, refetch } = useIngredient(barId, id);
  const ingredient = isPending ? placeholders.ingredients.single : data;

  return (
    <ScreenFrame className="z-200 bg-slate-100">
      <div className="mx-auto grid max-w-5xl md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:gap-10 md:px-6 md:py-6">
        <div className="relative md:sticky md:top-6 md:self-start">
          <Photo
            image={ingredient?.cardImage}
            alt={ingredient?.name}
            fallback={BottleWine}
            className={cn('aspect-5/4 md:aspect-square md:rounded-3xl')}
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
      </div>
      <div className="px-4 pb-20 pt-6 md:px-0 md:pt-2">
        {error && <ErrorState what="this cocktail" onRetry={() => refetch()} />}
        {ingredient && <IngredientDetail barId={barId} ingredient={ingredient} isPending={isPending} />}
      </div>
    </ScreenFrame>
  );
}

type IngredientDetailProps = {
  barId: string;
  ingredient: IngredientDTO;
  isPending?: boolean;
};
function IngredientDetail(props: IngredientDetailProps) {
  const { barId, ingredient, isPending: skeleton } = props;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h1 className={cn('rounded-md font-serif text-4xl leading-none tracking-tight', { skeleton })}>
          {ingredient.name}
        </h1>
        <ul className="flex flex-wrap gap-2">
          <li>
            <Stock available={ingredient.available} skeleton={skeleton} />
          </li>
          {ingredient.tags.map((tag) => (
            <li key={tag.id}>
              <TagChip className={cn({ skeleton })} to={`/bar/${barId}/ingredients?tag=${tagFullKey(tag)}`}>
                {tag.name}
              </TagChip>
            </li>
          ))}
        </ul>
        {ingredient.description && (
          <p className={cn('max-w-prose rounded-md font-serif text-lg leading-relaxed text-slate-700', { skeleton })}>
            {ingredient.description}
          </p>
        )}
      </div>

      <UsedIn barId={barId} ingredientId={ingredient.id} skeleton={skeleton} />
    </div>
  );
}

type StockVariantProps = {
  className: string;
  Icon: LucideIcon;
  label: string;
};
const stockVariants = {
  available: {
    className: 'bg-slate-900 text-white',
    Icon: Check,
    label: 'In stock',
  },
  outOfStock: {
    className: 'border border-slate-300 bg-slate-200 text-slate-600',
    Icon: CircleOff,
    label: 'Out of stock',
  },
} satisfies Record<string, StockVariantProps>;

type StockProps = { available: boolean; skeleton?: boolean };
function Stock(props: StockProps) {
  const { available, skeleton } = props;
  const { className, Icon, label } = available ? stockVariants.available : stockVariants.outOfStock;

  return (
    <span
      className={cn(
        'box-border inline-flex max-h-7 w-fit items-center gap-2 rounded-full py-1 pl-2.5 pr-3 text-sm font-medium',
        className,
        { skeleton }
      )}
    >
      <Icon className="size-3" strokeWidth={2.5} />
      {label}
    </span>
  );
}

type UsedInProps = {
  barId: string;
  ingredientId: string;
  skeleton?: boolean;
};
function UsedIn(props: UsedInProps) {
  const { barId, ingredientId, skeleton } = props;
  const list = useCocktailList(barId);
  const isPending = list.isPending || skeleton;

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
        {!isPending && list.isSuccess ? `Used in ${uses.length} ${pluralize(uses.length, 'cocktail')}` : 'Used in'}
      </h2>
      {isPending && (
        <div aria-hidden className="flex flex-col gap-2">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="skeleton h-16 w-full rounded-2xl" />
          ))}
        </div>
      )}
      {list.isError && <ErrorState what="cocktails" onRetry={() => list.refetch()} />}
      {!isPending && list.isSuccess && uses.length === 0 && (
        <p className="text-sm text-slate-500">No cocktail in this bar uses it yet.</p>
      )}
      {!isPending && list.isSuccess && uses.length > 0 && (
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

type UseRowProps = {
  barId: string;
  cocktail: CocktailDTO;
  item: CocktailDTO['recipe'][number];
  skeleton?: boolean;
};
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
      <Photo image={cocktail.iconImage} fallback={Martini} className="size-12 shrink-0 rounded-lg" />
      <span className="min-w-0 flex-1 truncate font-serif text-lg">{cocktail.name}</span>
      <span className="flex shrink-0 flex-col items-end text-sm">
        <span className="font-medium tabular-nums">{formatAmount(item)}</span>
        {note && <span className="text-slate-500">{note}</span>}
      </span>
    </Link>
  );
}
