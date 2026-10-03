import { useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';
import { Wine } from 'lucide-react';
import { z } from 'zod';

import { IngredientDTO } from '@repo/dtos';
import { cn } from '~/utils/classnames';
import { useIngredientList, useSetIngredientAvailability } from '~/queries/ingredient';
import { placeholders } from '~/data/placeholders';
import { ScreenFrame, focusRing } from '~/components/common';
import { BackButton } from '~/components/back-button';
import { TagSubtitle } from '~/components/catalog/tag-subtitle';
import { FilterButton, NewLink, SearchButton } from '~/components/catalog/action-buttons';
import { EmptyState, ErrorState } from '~/components/catalog/state-message';
import { Photo } from '~/components/catalog/photo';
import { Switch } from '~/components/switch';
import { SearchField } from '~/components/catalog/filters';

const Params = z.object({ barId: z.string() });
const QueryParams = z.object({ tag: z.string().optional() });

export function IngredientListScreen() {
  const params = useParams();
  const { barId } = useMemo(() => Params.parse(params), [params]);
  const [query] = useSearchParams();
  const { tag } = useMemo(() => QueryParams.parse(Object.fromEntries(query.entries())), [query]);

  const [searchOpen, setSearchOpen] = useState(false);
  const toggleSearch = () => setSearchOpen((prev) => !prev);
  const [searchText, setSearchText] = useState('');
  const clearSearch = () => setSearchText('');

  const list = useIngredientList(barId, { tag });
  const visible = useMemo(() => {
    const needle = searchText.trim().toLowerCase();
    if (list.isPending) return placeholders.ingredients.list;
    return (list.data ?? []).filter((o) => (needle ? o.name.toLowerCase().includes(needle) : true));
  }, [list.isPending, list.data, searchText]);
  const groups = useMemo(() => groupByLetter(visible), [visible]);

  return (
    <ScreenFrame className="z-100 border-l-8 border-slate-300 bg-slate-200 dark:border-slate-700 dark:bg-slate-950">
      <header className="sticky top-0 z-10 border-slate-300/80 bg-slate-200/80 backdrop-blur dark:border-slate-700/80 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 pb-3 pt-3">
          <div className="flex items-center gap-3">
            <BackButton fallback={`/bar/${barId}`} />
            <div className="-ml-2 mr-auto flex flex-col">
              <h1 className={cn('font-serif text-3xl tracking-tight', { 'text-xl': !!tag })}>Ingredients</h1>
              {tag && <TagSubtitle barId={barId} tagKey={tag} />}
            </div>
            <NewLink to={`/bar/${barId}/ingredients/new`} label="New ingredient" />
            <SearchButton onClick={toggleSearch} active={searchText.trim().length > 0} />
            <FilterButton />
          </div>
          {searchOpen && (
            <div className="flex items-center gap-2">
              <SearchField
                label="Search ingredients"
                value={searchText}
                onChange={setSearchText}
                onClear={clearSearch}
              />
            </div>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 pb-4 pt-2">
        {list.isError && <ErrorState what="ingredients" onRetry={() => list.refetch()} />}
        {list.isSuccess && visible.length === 0 && (
          <EmptyState title="No ingredients here yet">Ingredients added to this bar will show up here.</EmptyState>
        )}
        {visible.length > 0 && (
          <div className="flex flex-col gap-5">
            {groups.map(([letter, items]) => (
              <IngredientGroup key={letter} barId={barId} groupName={letter} items={items} skeleton={list.isPending} />
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

type IngredientGroupProps = {
  barId: string;
  groupName: string;
  items: IngredientDTO[];
  skeleton?: boolean;
};
function IngredientGroup(props: IngredientGroupProps) {
  const { barId, groupName, items, skeleton } = props;
  return (
    <section aria-label={groupName} className="flex flex-col gap-1.5">
      <h2
        aria-hidden
        className={cn('w-fit rounded-md px-1 font-serif text-xl leading-none text-slate-400 dark:text-slate-500', {
          skeleton,
        })}
      >
        {groupName}
      </h2>
      <ul
        className={cn(
          'divide-y divide-slate-300/50 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:divide-slate-700/50 dark:border-slate-800 dark:bg-slate-900',
          {}
        )}
      >
        {items.map((ingredient) => (
          <li key={ingredient.id}>
            <IngredientRow barId={barId} ingredient={ingredient} skeleton={skeleton} />
          </li>
        ))}
      </ul>
    </section>
  );
}

type IngredientRowProps = {
  barId: string;
  ingredient: IngredientDTO;
  skeleton?: boolean;
};
function IngredientRow(props: IngredientRowProps) {
  const { barId, ingredient, skeleton } = props;
  const detail = ingredient.description || ingredient.tags.map((t) => t.name).join(', ');

  const setAvailability = useSetIngredientAvailability(barId);

  return (
    <div className="flex items-center gap-3 p-3 transition-colors hover:bg-slate-100 active:bg-slate-200/50 dark:hover:bg-slate-800 dark:active:bg-slate-800/50">
      <Link
        to={`/bar/${barId}/ingredients/${ingredient.id}`}
        className={cn(
          'flex min-w-0 flex-1 items-center gap-3',
          focusRing,
          'focus-visible:ring-inset focus-visible:ring-offset-0',
          { 'pointer-events-none': skeleton }
        )}
      >
        <Photo
          image={ingredient.iconImage}
          fallback={Wine}
          fit="contain"
          dim={!ingredient.available}
          className={cn('size-12 shrink-0 rounded-lg border border-slate-100 dark:border-slate-800', { skeleton })}
        />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className={cn('truncate font-medium', { 'skeleton w-fit': skeleton })}>{ingredient.name}</div>
          {detail && (
            <div className={cn('truncate text-sm text-slate-500 dark:text-slate-400', { 'skeleton w-fit': skeleton })}>
              {detail}
            </div>
          )}
        </div>
      </Link>
      <Switch
        checked={ingredient.available}
        disabled={setAvailability.isPending}
        onCheckedChange={(available) => setAvailability.mutate({ id: ingredient.id, available })}
        aria-label={`Mark ${ingredient.name} as ${ingredient.available ? 'out of stock' : 'in stock'}`}
        className={cn({ skeleton })}
      />
    </div>
  );
}
