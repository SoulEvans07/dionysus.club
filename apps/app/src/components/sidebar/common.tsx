import { type LucideIcon, Crown, Users } from 'lucide-react';
import { type DynamicIcon } from '@repo/dtos';
import { tw } from '~/utils/twElem';

const GroupWrapper = tw.div('flex flex-col gap-2 rounded-xl bg-slate-900 p-1');

const ButtonBase = tw.div(
  'relative flex aspect-square size-12 shrink-0 items-center justify-center overflow-hidden bg-slate-800 fill-slate-300 text-slate-300'
);
const SquareButton = tw.comp(ButtonBase, 'rounded-lg');
const CircleButton = tw.comp(ButtonBase, 'rounded-full');

const Icons = {
  crown: Crown,
  users: Users,
} satisfies Record<DynamicIcon, LucideIcon>;

export const Sidebar = {
  Icons,
  GroupWrapper,
  ButtonBase,
  SquareButton,
  CircleButton,
};
