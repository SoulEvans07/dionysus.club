import { useState } from 'react';
import { ChevronsRight, Compass, Plus } from 'lucide-react';
import { cva } from 'class-variance-authority';

import { tw } from '~/utils/twElem';
import { cn } from '~/utils/classnames';
import { styles } from '~/styles/constants';
import { useSidebarData } from '~/queries/sidebar';
import { BarGroupFolder } from './bar-group';
import { BarIcon } from './bar-icon';
import { Sidebar } from './common';

const sidebar = cva(
  'absolute bottom-0 left-0 top-0 z-10 flex shrink-0 grow-0 select-none flex-col gap-2 rounded-r-2xl bg-slate-400 p-2.5',
  {
    variants: {
      open: {
        true: ['w-[calc(100%-6rem)]', 'lg:w-80'],
        false: ['w-18', 'lg:w-18'],
      },
    },
    defaultVariants: { open: false },
  }
);

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
        <Sidebar.GroupWrapper>
          <BarIcon bar={data.personal} open={open} color="slate" />
        </Sidebar.GroupWrapper>
        {data.groups.map((group) => (
          <BarGroupFolder key={group.id} group={group} open={open} />
        ))}
      </div>
      <List className="mt-auto">
        <Sidebar.CircleButton>
          <Plus />
        </Sidebar.CircleButton>
        <Sidebar.CircleButton>
          <Compass />
        </Sidebar.CircleButton>
      </List>
      <Separator />
      <List>
        <Sidebar.CircleButton onClick={toggleSidebar}>
          <ChevronsRight className={cn('rotate-0', { 'rotate-180': open })} />
        </Sidebar.CircleButton>
      </List>
    </div>
  );
}

const List = tw.div('flex flex-col gap-2');
const Separator = tw.hr('mx-1 border-slate-900');
