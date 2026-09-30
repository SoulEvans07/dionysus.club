import { cn } from '~/utils/classnames';
import { focusRing } from '~/components/common';

type IconButtonProps = React.PropsWithChildren<{
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}>;
export function IconButton(props: IconButtonProps) {
  const { label, onClick, disabled, className, children } = props;

  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'grid size-11 shrink-0 place-items-center rounded-lg text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900 disabled:pointer-events-none disabled:opacity-30',
        className,
        focusRing
      )}
    >
      {children}
    </button>
  );
}
