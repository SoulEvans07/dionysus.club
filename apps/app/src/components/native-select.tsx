import { ChevronDown } from 'lucide-react';
import { cn } from '~/utils/classnames';

type NativeSelectProps = React.ComponentProps<'select'> & {
  containerClass?: string;
};
export function NativeSelect(props: NativeSelectProps) {
  const { containerClass, className, children, ...rest } = props;
  return (
    <div className={cn('relative', containerClass)}>
      <select
        data-slot="native-select"
        className={cn(
          'border-input h-9 w-full min-w-0 appearance-none rounded-md border bg-transparent pl-3 pr-9 text-base outline-none transition-[color,box-shadow] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
          className
        )}
        {...rest}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
    </div>
  );
}
