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
} from 'lucide-react';

import { BarType } from '@repo/dtos';
import { useBar, useBarMembers } from '~/queries/bar';
import { useCocktailList } from '~/queries/cocktail';
import { useIngredientList } from '~/queries/ingredient';
import { tw } from '~/utils/twElem';
import { H1 } from '~/components/common';
import { sizes } from '~/styles/constants';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '~/components/shadcn/collapsible';
import { cn } from '~/utils/classnames';

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

  return (
    <div
      className="mt-1 flex min-h-[calc(100%-0.25rem)] flex-col gap-2 rounded-tl-2xl border-l border-t border-slate-200 bg-slate-300"
      style={{ width: `calc(100% - ${sizes.mainSidebarGuard})` }}
    >
      <div
        className="aspect-5/2 bg-linear-to-t flex flex-col justify-end rounded-tl-2xl from-slate-500 to-slate-50"
        style={banner}
      />
      <div className="flex flex-col px-3">
        <H1 className="mb-0">{bar.data?.name}</H1>
        <div className="flex flex-row items-center gap-2">
          <div className="flex flex-row items-center gap-1">
            <TypeIcon className="size-4" />
            <span>{type}</span>
          </div>
          {type !== 'personal' && (
            <>
              <span>|</span>
              <span>
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
};

const NavbarGuard = tw.div('navbar-guard', { minHeight: sizes.bottomNavbarGuard });

const MenuItem = tw.button('flex flex-row items-center gap-2 rounded-md px-2 py-1 active:bg-slate-400/40');
const MenuButton = tw.button(
  'flex flex-row items-center justify-center gap-2 rounded-md bg-slate-400/80 px-2 py-1 active:bg-slate-400'
);

type CollapsibleSectionProps = PropsWithChildren & {
  title: string;
};
function CollapsibleSection(props: CollapsibleSectionProps) {
  const { title, children } = props;
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="flex flex-col">
      <CollapsibleTrigger asChild>
        <MenuItem>
          <h2 className="font-semibold">{title}</h2>
          <ChevronRight className={cn('ml-auto size-4', { 'rotate-90': isOpen })} />
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
  const { isPending, error, data, isFetching } = useIngredientList(barId);
  const navigate = useNavigate();

  if (isPending) return <div>Loading...</div>;
  if (error) return <div>Error</div>;

  return (
    <CollapsibleSection title="Ingredients">
      <MenuItem onClick={() => navigate(`/bar/${barId}/ingredients`)}>
        <AtSign className="size-4" />
        <span>All</span>
      </MenuItem>
      {data.map((ingr) => (
        <MenuItem key={ingr.id} onClick={() => navigate(`/bar/${barId}/ingredients/${ingr.id}`)}>
          <Hash className="size-4" />
          <span>{ingr.name}</span>
        </MenuItem>
      ))}
    </CollapsibleSection>
  );
}

type CocktailListProps = { barId: string };
function CocktailSection(props: CocktailListProps) {
  const { barId } = props;
  const { isPending, error, data, isFetching } = useCocktailList(barId);
  const navigate = useNavigate();

  if (isPending) return <div>Loading...</div>;
  if (error) return <div>Error</div>;

  return (
    <CollapsibleSection title="Cocktails">
      <MenuItem onClick={() => navigate(`/bar/${barId}/cocktails`)}>
        <AtSign className="size-4" />
        <span>All</span>
      </MenuItem>
      {data.map((cocktail) => (
        <MenuItem key={cocktail.id} onClick={() => navigate(`/bar/${barId}/cocktails/${cocktail.id}`)}>
          <Hash className="size-4" />
          <span>{cocktail.name}</span>
        </MenuItem>
      ))}
    </CollapsibleSection>
  );
}
