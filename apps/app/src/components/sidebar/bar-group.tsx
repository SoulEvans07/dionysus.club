import { useMemo, useState } from 'react';
import { LucideIcon } from 'lucide-react';
import colors from 'tailwindcss/colors';

import { SidebarBarGroup, TwBaseColor } from '@repo/dtos';
import { cn } from '~/utils/classnames';
import { BarIcon } from './bar-icon';
import { Sidebar } from './common';

type BarGroupProps = {
  group: SidebarBarGroup;
  open?: boolean;
};
export function BarGroupFolder(props: BarGroupProps) {
  const { group, open } = props;
  const shade = colors[group.color];

  const [collapse, setCollapse] = useState(false);
  const height = useMemo(() => {
    const n = collapse ? 0 : group.bars.length;
    return `calc((${n} + 1) * 2.75rem + (${n} + 1) * 0.5rem)`;
  }, [group.bars.length, collapse]);

  if (group.bars.length === 0) return null;

  return (
    <Sidebar.GroupWrapper
      style={{
        color: shade[300],
        backgroundColor: shade[900],
        height,
        transition: 'height 500ms',
      }}
    >
      <GroupFolder
        name={group.name}
        color={group.color ?? 'slate'}
        Icon={Sidebar.Icons[group.icon]}
        open={open}
        onClick={() => setCollapse((prev) => !prev)}
      />
      {group.bars.map((bar, i) => (
        <BarIcon index={i} key={bar.id} bar={bar} open={open} color={group.color} />
      ))}
    </Sidebar.GroupWrapper>
  );
}

type GroupFolderIconProps = {
  name: string;
  color: TwBaseColor;
  Icon: LucideIcon;
  open?: boolean;
  onClick?: VoidFunction;
};
function GroupFolder(props: GroupFolderIconProps) {
  const { name, color, Icon, open, onClick } = props;
  return (
    <div className="flex h-11 items-center" onClick={onClick}>
      <Icon className="size-11 p-3" style={{ stroke: colors[color][400] }} />
      <span className={cn('ml-4', { hidden: !open })}>{name}</span>
    </div>
  );
}
