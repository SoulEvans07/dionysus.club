import { Check } from 'lucide-react';

import { cn } from '~/utils/classnames';

type StockStatusProps = { available: boolean; className?: string };

export function StockStatus(props: StockStatusProps) {
  const { available, className } = props;

  if (available) {
    return (
      <span className={cn('flex shrink-0 items-center gap-1.5 text-sm font-medium', className)}>
        <span className="grid size-4 place-items-center rounded-full bg-slate-900 text-white">
          <Check className="size-2.5" strokeWidth={3.5} />
        </span>
        In stock
      </span>
    );
  }

  return (
    <span className={cn('flex shrink-0 items-center gap-1.5 text-sm text-slate-500', className)}>
      <span className="size-4 rounded-full border-2 border-slate-300" />
      Out
    </span>
  );
}
