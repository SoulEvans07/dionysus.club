import colors from 'tailwindcss/colors';

import { BarDTO, TwBaseColor } from '@repo/dtos';
import { cn } from '~/utils/classnames';
import { Sidebar } from './common';

type BarIconProps = {
  index?: number;
  bar: BarDTO;
  open?: boolean;
  color: TwBaseColor;
};
export function BarIcon(props: BarIconProps) {
  const { index, bar, open, color } = props;
  const shade = colors[color];

  return (
    <div className="flex flex-row items-center gap-2 overflow-hidden" style={{ color: shade[400], zIndex: index }}>
      <Sidebar.SquareButton className="size-11" style={{ color: shade[400], backgroundColor: shade[800] }}>
        {bar.barType !== 'personal' && bar.logoImage ? (
          <img src={bar.logoImage.url} className="absolute inset-0" />
        ) : (
          <span className="text-2xl font-semibold">{bar.name[0]}</span>
        )}
      </Sidebar.SquareButton>
      <span className={cn('ml-2', { hidden: !open })}>{bar.name}</span>
    </div>
  );
}
