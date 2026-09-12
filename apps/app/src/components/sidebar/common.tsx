import { type LucideIcon, Crown, UsersRound } from 'lucide-react';
import { type DynamicIcon } from '@repo/dtos';
import { tw } from '~/utils/twElem';

const GroupWrapper = tw.div('flex flex-col gap-2 rounded-xl bg-indigo-900 p-1');

const ButtonBase = tw.div(
  'relative flex aspect-square size-12 shrink-0 items-center justify-center overflow-hidden bg-indigo-800 fill-indigo-300 text-indigo-300'
);
const SquareButton = tw.comp(ButtonBase, 'rounded-lg');
const CircleButton = tw.comp(ButtonBase, 'rounded-full');

const Icons = {
  crown: Crown,
  usersRound: UsersRound,
} satisfies Record<DynamicIcon, LucideIcon>;

export const Sidebar = {
  Icons,
  GroupWrapper,
  ButtonBase,
  SquareButton,
  CircleButton,
};
