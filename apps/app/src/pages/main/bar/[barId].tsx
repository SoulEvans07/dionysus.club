import { useMemo, useState, type PropsWithChildren } from 'react';
import { useNavigate, useParams } from 'react-router';
import { z } from 'zod';
import {
  ChevronRight,
  Settings,
  Users,
  Search,
  UserPlus,
  Hash,
  AtSign,
  LucideIcon,
  CircleUser,
  Globe,
  Lock,
  Cog,
} from 'lucide-react';

import { BarType } from '@repo/dtos';
import { useBar, useBarMembers } from '~/queries/bar';
import { useCocktailTagList, useIngredientTagList } from '~/queries/tag';
import { tw } from '~/utils/twElem';
import { H1 } from '~/components/common';
import { sizes } from '~/styles/constants';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '~/components/shadcn/collapsible';
import { cn } from '~/utils/classnames';
import { Spinner } from '~/components/shadcn/spinner';
import { tagFullKeyUI } from '~/utils/tags';

const Params = z.object({ barId: z.string() });

export function BarScreen() {
  const params = useParams();
  const { barId } = useMemo(() => Params.parse(params), [params]);
  const bar = useBar(barId);
  const banner = bar.data?.bannerImage?.url ? { backgroundImage: `url(${bar.data.bannerImage.url})` } : {};
  const type: BarType = bar.data?.barType ?? 'personal';
  const TypeIcon = typeIcons[type];

  const members = useBarMembers(barId);
  const membersCount = members.data?.length ?? 0;

  const skeleton = useMemo(() => bar.isPending || members.isPending, [bar.isPending, members.isPending]);

  return (
    <div
      className="mt-1 flex min-h-[calc(100%-0.25rem)] flex-col gap-2 rounded-tl-2xl border-l border-t border-slate-200 bg-slate-300"
      style={{ width: `calc(100% - ${sizes.mainSidebarGuard})` }}
    >
      <div
        className="aspect-5/2 bg-linear-to-t flex flex-col justify-end rounded-tl-2xl from-slate-500 to-slate-50"
        style={banner}
      />
      <div className="flex flex-col gap-0.5 px-3">
        <H1 className={cn('mb-0', { skeleton })}>{bar.data?.name ?? 'Bar'}</H1>
        <div className="flex flex-row items-center gap-2">
          <div className={cn('flex flex-row items-center gap-1', { skeleton })}>
            <TypeIcon className="size-4" />
            <span>{type}</span>
          </div>
          {type !== 'personal' && (
            <>
              <span>|</span>
              <span className={cn({ skeleton })}>
                {membersCount} {membersCount > 1 ? 'members' : 'member'}
              </span>
            </>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2 px-3">
        <div className="flex flex-row gap-2">
          <MenuButton className="grow">
            <Search className="size-4" />
            <span>Search</span>
          </MenuButton>
          <MenuButton>
            <UserPlus className="size-4" />
          </MenuButton>
        </div>
      </div>
      <div className="flex flex-col gap-2 px-2">
        <IngredientSection barId={barId} />
        <CocktailSection barId={barId} />
      </div>
      <div className="mt-auto flex flex-col gap-2 px-2">
        <hr className="mx-2 border-slate-400/80" />
        <MenuItem>
          <Users className="size-4" />
          <span>Members</span>
        </MenuItem>
        <MenuItem>
          <Settings className="size-4" />
          <span>Settings</span>
        </MenuItem>
      </div>
      <NavbarGuard />
    </div>
  );
}

const typeIcons: Record<BarType, LucideIcon> = {
  personal: CircleUser,
  public: Globe,
  private: Lock,
  system: Cog,
};

const NavbarGuard = tw.div('navbar-guard', { minHeight: sizes.bottomNavbarGuard });

const MenuItem = tw.button('flex flex-row items-center gap-2 rounded-md px-2 py-1 active:bg-slate-400/40');
const MenuButton = tw.button(
  'flex flex-row items-center justify-center gap-2 rounded-md bg-slate-400/80 px-2 py-1 active:bg-slate-400'
);

type CollapsibleSectionProps = PropsWithChildren & {
  title: string;
  isPending?: boolean;
  isFetching?: boolean;
};
function CollapsibleSection(props: CollapsibleSectionProps) {
  const { children, title, isPending, isFetching } = props;
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="flex flex-col">
      <CollapsibleTrigger disabled={isPending} asChild>
        <MenuItem>
          <div className="mr-auto font-semibold">{title}</div>
          {(isPending || isFetching) && <Spinner className="size-4 opacity-80" />}
          {!isPending && <ChevronRight className={cn('size-4', { 'rotate-90': isOpen })} />}
          <span className="sr-only">Toggle {title}</span>
        </MenuItem>
      </CollapsibleTrigger>
      <CollapsibleContent className="flex flex-col">{children}</CollapsibleContent>
    </Collapsible>
  );
}

type IngredientListProps = { barId: string };
function IngredientSection(props: IngredientListProps) {
  const { barId } = props;
  const { isPending, error, data, isFetching } = useIngredientTagList(barId);
  const navigate = useNavigate();

  if (error) return <div>Error</div>;

  return (
    <CollapsibleSection title="Ingredients" isPending={isPending} isFetching={isFetching}>
      <MenuItem onClick={() => navigate(`/bar/${barId}/ingredients`)}>
        <AtSign className="size-4" />
        <span>All</span>
      </MenuItem>
      {data?.map((tag) => (
        <MenuItem key={tag.id}>
          <Hash className="size-4" />
          <span>{tag.name}</span>
          <span className="ml-auto text-slate-400">[{tagFullKeyUI(tag)}]</span>
        </MenuItem>
      ))}
    </CollapsibleSection>
  );
}

type CocktailListProps = { barId: string };
function CocktailSection(props: CocktailListProps) {
  const { barId } = props;
  const { isPending, error, data, isFetching } = useCocktailTagList(barId);
  const navigate = useNavigate();

  if (error) return <div>Error</div>;

  return (
    <CollapsibleSection title="Cocktails" isPending={isPending} isFetching={isFetching}>
      <MenuItem onClick={() => navigate(`/bar/${barId}/cocktails`)}>
        <AtSign className="size-4" />
        <span>All</span>
      </MenuItem>
      {data?.map((tag) => (
        <MenuItem key={tag.id}>
          <Hash className="size-4" />
          <span>{tag.name}</span>
          <span className="ml-auto text-slate-400">[{tagFullKeyUI(tag)}]</span>
        </MenuItem>
      ))}
    </CollapsibleSection>
  );
}
