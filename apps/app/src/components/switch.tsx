import { Switch as SwitchPrimitive } from 'radix-ui';
import { cn } from '~/utils/classnames';

export function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        'inline-flex h-7 w-12 shrink-0 items-center rounded-full border-2 border-transparent bg-slate-300 outline-none transition-colors dark:bg-slate-700',
        'focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
        'data-[state=checked]:bg-slate-900 dark:data-[state=checked]:bg-slate-100',
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="pointer-events-none block size-6 rounded-full bg-white shadow-sm transition-transform data-[state=checked]:translate-x-5 dark:data-[state=checked]:bg-slate-900" />
    </SwitchPrimitive.Root>
  );
}
