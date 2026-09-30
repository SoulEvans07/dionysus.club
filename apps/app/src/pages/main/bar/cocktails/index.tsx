import { useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';
import { Check, ListSortAscending, ListSortDescending, Martini } from 'lucide-react';
import { z } from 'zod';

import { CocktailDTO } from '@repo/dtos';
import { cn } from '~/utils/classnames';
import { useCocktailList } from '~/queries/cocktail';
import { placeholders } from '~/data/placeholders';
import { canMake } from '~/utils/recipe';
import { tw } from '~/utils/twElem';
import { ScreenFrame, focusRing } from '~/components/common';
import { BackButton } from '~/components/back-button';
import { FilterButton, NewLink, SearchButton } from '~/components/catalog/action-buttons';
import { Photo } from '~/components/catalog/photo';
import { TagSubtitle } from '~/components/catalog/tag-subtitle';
import { EmptyState, ErrorState } from '~/components/catalog/state-message';
import { FilterContainer, SearchField } from '~/components/catalog/filters';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/shadcn/tabs';
import { sortTagByFullKey } from '~/utils/tags';

const Params = z.object({ barId: z.string() });
const QueryParams = z.object({ tag: z.string().optional() });

export function CocktailListScreen() {
  const params = useParams();
  const { barId } = useMemo(() => Params.parse(params), [params]);
  const [query] = useSearchParams();
  const { tag } = useMemo(() => QueryParams.parse(Object.fromEntries(query.entries())), [query]);

  const [searchOpen, setSearchOpen] = useState(false);
  const toggleSearch = () => setSearchOpen((prev) => !prev);
  const [searchText, setSearchText] = useState('');
  const clearSearch = () => setSearchText('');

  const [sortBy, setSortBy] = useState<SortKeys>('name');
  const [sortDir, setSortDir] = useState<SortDir>(SortDir.ASC);
  const onSortChange = (optKey: SortKeys) => {
    if (optKey === sortBy) {
      setSortDir((prev) => (prev === SortDir.ASC ? SortDir.DES : SortDir.ASC));
    } else {
      setSortBy(optKey);
      setSortDir(SortDir.ASC);
    }
  };

  const list = useCocktailList(barId, { tag });
  const visible = useMemo(() => {
    const needle = searchText.trim().toLowerCase();
    if (list.isPending) return placeholders.cocktails.list;

    const sortFn: CocktailSortFn = (a, b) => sortDir * sortOptions[sortBy].fn(a, b);
    return (list.data ?? []).filter((o) => (needle ? o.name.toLowerCase().includes(needle) : true)).sort(sortFn);
  }, [list.isPending, list.data, sortBy, sortDir, searchText]);

  return (
    <ScreenFrame className="z-100 border-l-8 border-slate-300 bg-slate-200">
      <header className="sticky top-0 z-10 border-slate-300/80 bg-slate-200/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 pb-3 pt-3">
          <div className="flex items-center gap-3">
            <BackButton fallback={`/bar/${barId}`} />
            <div className="-ml-2 mr-auto flex flex-col">
              <h1 className={cn('font-serif text-3xl tracking-tight', { 'text-xl': !!tag })}>Cocktails</h1>
              {tag && <TagSubtitle barId={barId} tagKey={tag} />}
            </div>
            <NewLink to={`/bar/${barId}/cocktails/new`} label="New cocktail" />
            <SearchButton onClick={toggleSearch} active={searchText.trim().length > 0} />
            <Settings sortBy={sortBy} sortDir={sortDir} onSortChange={onSortChange} />
          </div>
          {searchOpen && (
            <div className="flex items-center gap-2">
              <SearchField label="Search cocktails" value={searchText} onChange={setSearchText} onClear={clearSearch} />
            </div>
          )}
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
  const ready = canMake(cocktail);

  return (
    <Link
      to={`/bar/${barId}/cocktails/${cocktail.id}`}
      className={cn('aspect-3/4 relative flex rounded-xl text-left outline-none', focusRing, { skeleton })}
    >
      <Photo
        className={cn(
          'aspect-3/4 rounded-xl bg-transparent bg-cover bg-no-repeat transition-transform group-active:scale-[0.98]'
        )}
        image={cocktail.cardImage}
        fallback={Martini}
      />
      {ready && (
        <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-slate-900 py-0.5 pl-1.5 pr-2 text-xs font-medium text-white">
          <Check className="size-3" strokeWidth={3} />
          Ready
        </span>
      )}
      <div className="bg-linear-to-b absolute bottom-0 left-0 right-0 rounded-bl-lg rounded-br-lg from-transparent to-black/50 px-3 pb-2 pt-6 font-medium text-white transition-transform group-active:scale-[0.98]">
        {cocktail.name}
      </div>
    </Link>
  );
}

type CocktailSortFn = (a: CocktailDTO, b: CocktailDTO) => number;
type SortOption<Key extends string = string> = {
  key: Key;
  label: string;
  fn: CocktailSortFn;
};
const defineSortOptions = <K extends string>(options: { [Key in K]: SortOption<Key> }) => options;
const sortOptions = defineSortOptions({
  name: {
    key: 'name',
    label: 'Name',
    fn: (a, b) => a.name.localeCompare(b.name),
  },
  spirit: {
    key: 'spirit',
    label: 'Spirit',
    fn: (a, b) => {
      const aSpirit = a.tags.find((o) => o.namespace === 'spirit');
      const bSpirit = b.tags.find((o) => o.namespace === 'spirit');
      if (!aSpirit) return -1;
      if (!bSpirit) return 1;
      return sortTagByFullKey(aSpirit, bSpirit);
    },
  },
});
type SortKeys = keyof typeof sortOptions;

const SortDir = {
  ASC: 1,
  DES: -1,
} as const;
type SortDir = (typeof SortDir)[keyof typeof SortDir];

const SettingsContent = tw.comp(TabsContent, 'border-t border-slate-400 p-2');
const SettingsCard = tw.div('rounded-lg bg-slate-100 p-2');

type SettingsProps = {
  sortBy: SortKeys;
  sortDir: SortDir;
  onSortChange: (optKey: SortKeys) => void;
};
function Settings(props: SettingsProps) {
  const { sortBy, sortDir, onSortChange } = props;
  const [maxMissing, setMaxMissing] = useState(0);

  return (
    <FilterContainer>
      <FilterButton />
      <div id="settings-conent" className="flex flex-col">
        <Tabs defaultValue="filter" className="w-full flex-col gap-0 pt-2">
          <TabsList variant="line" className="w-full px-4">
            <TabsTrigger value="filter">Filter</TabsTrigger>
            <TabsTrigger value="sort">Sort</TabsTrigger>
            <TabsTrigger value="display">Display</TabsTrigger>
          </TabsList>
          <SettingsContent value="filter">
            <SettingsCard>
              <div>filter settings</div>
            </SettingsCard>
          </SettingsContent>
          <SettingsContent value="sort">
            <SettingsCard>
              <ul className="flex flex-col gap-2">
                {Object.values(sortOptions).map((opt) => {
                  const active = opt.key === sortBy;

                  return (
                    <div
                      key={opt.key}
                      className={cn('flex w-full flex-row items-center gap-4 px-2 text-lg', { 'pl-10': !active })}
                      onClick={() => onSortChange(opt.key)}
                    >
                      {active && sortDir === SortDir.ASC && <ListSortAscending className="size-4" />}
                      {active && sortDir === SortDir.DES && <ListSortDescending className="size-4" />}
                      {opt.label}
                    </div>
                  );
                })}
              </ul>
            </SettingsCard>
          </SettingsContent>
          <SettingsContent value="display">
            <SettingsCard>
              <div>display settings</div>
            </SettingsCard>
          </SettingsContent>
        </Tabs>
      </div>
    </FilterContainer>
  );
}
