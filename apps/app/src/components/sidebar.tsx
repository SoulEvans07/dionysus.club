import { useMemo, useState } from 'react';
import { ChevronsRight, Compass, Plus, LucideIcon } from 'lucide-react';
import { cva } from 'class-variance-authority';
import colors from 'tailwindcss/colors';

import { BarDTO } from '@repo/dtos';
import { tw } from '~/utils/twElem';
import { cn } from '~/utils/classnames';
import { styles } from '~/styles/constants';
import { BarGroup, useSidebarData } from '~/queries/sidebar';

export function MainSidebar() {
  const [open, setOpen] = useState(false);
  const toggleSidebar = () => setOpen((prev) => !prev);

  const { isPending, error, data } = useSidebarData();

  if (isPending) return null;
  if (error) return null;

  return (
    <div
      className={sidebar({ open })}
      style={{ paddingBottom: `calc(${styles.bottomNavbar.height} + 1.75 * ${styles.bottomNavbar.marginBottom})` }}
    >
      <div className="flex h-full flex-col gap-2 overflow-y-auto">
        <GroupWrapper>
          <BarIcon bar={data.personal} open={open} />
        </GroupWrapper>
        <BarGroupFolder group={data.owned} open={open} />
        <BarGroupFolder group={data.memberOf} open={open} />
      </div>
      <List className="mt-auto">
        <CircleButton>
          <Plus />
        </CircleButton>
        <CircleButton>
          <Compass />
        </CircleButton>
      </List>
      <Separator />
      <List>
        <CircleButton onClick={toggleSidebar}>
          <ChevronsRight className={cn('rotate-0', { 'rotate-180': open })} />
        </CircleButton>
      </List>
    </div>
  );
}

const sidebar = cva(
  'absolute bottom-0 left-0 top-0 flex shrink-0 grow-0 select-none flex-col gap-2 bg-indigo-950 p-2.5',
  {
    variants: {
      open: {
        true: ['w-[calc(100%-4rem)]', 'lg:w-80'],
        false: ['w-18', 'lg:w-18'],
      },
    },
    defaultVariants: {
      open: false,
    },
  }
);

const List = tw.div('flex flex-col gap-2');
const Separator = tw.hr('mx-1 border-indigo-900');
const ButtonBase = tw.div(
  'relative flex aspect-square size-12 shrink-0 items-center justify-center overflow-hidden bg-indigo-800 fill-indigo-300 text-indigo-300'
);

const CircleButton = tw.comp(ButtonBase, 'rounded-full');
const SquareButton = tw.comp(ButtonBase, 'rounded-lg');

const GroupWrapper = tw.div('flex flex-col gap-2 rounded-xl bg-indigo-900 p-1');

type GroupFolderIconProps = {
  name: string;
  color: string;
  Icon: LucideIcon;
  open?: boolean;
  onClick?: VoidFunction;
};
function GroupFolder(props: GroupFolderIconProps) {
  const { name, color, Icon, open, onClick } = props;
  return (
    <div className="flex h-11 items-center" onClick={onClick}>
      <Icon className="size-11 p-3" style={{ stroke: color }} />
      <span className={cn('ml-4', { hidden: !open })}>{name}</span>
    </div>
  );
}

type BarGroupProps = {
  group: BarGroup;
  open?: boolean;
};
function BarGroupFolder(props: BarGroupProps) {
  const { group, open } = props;

  const [collapse, setCollapse] = useState(false);
  const height = useMemo(() => {
    const n = collapse ? 0 : group.bars.length;
    return `calc((${n} + 1) * 2.75rem + (${n} + 1) * 0.5rem)`;
  }, [group.bars.length, collapse]);

  if (group.bars.length === 0) return null;

  return (
    <GroupWrapper style={{ ...group.style, height, transition: 'height 500ms' }}>
      <GroupFolder
        name={group.name}
        color={group.style.color}
        Icon={group.Icon}
        open={open}
        onClick={() => setCollapse((prev) => !prev)}
      />
      {group.bars.map((bar, i) => (
        <BarIcon idx={i} key={bar.id} bar={bar} open={open} btn={group.btnStyle} />
      ))}
    </GroupWrapper>
  );
}

type BarIconProps = { idx?: number; bar: BarDTO; open?: boolean; btn?: { color: string; backgroundColor: string } };
function BarIcon(props: BarIconProps) {
  const { idx, bar, open, btn = { color: colors.indigo[400], backgroundColor: colors.indigo[800] } } = props;

  return (
    <div className="flex flex-row items-center gap-2 overflow-hidden" style={{ color: btn.color, zIndex: idx }}>
      <SquareButton className="size-11" style={btn}>
        {bar.barType !== 'personal' && bar.logoImage ? (
          <img src={bar.logoImage.url} className="absolute inset-0" />
        ) : (
          <span className="text-2xl font-semibold">{bar.name[0]}</span>
        )}
      </SquareButton>
      <span className={cn('ml-2', { hidden: !open })}>{bar.name}</span>
    </div>
  );
}
