import { type PropsWithChildren, type ReactNode } from 'react';
import { ChevronRight, type LucideIcon } from 'lucide-react';
import { cn } from '~/utils/classnames';
import { Button } from '~/components/shadcn/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '~/components/shadcn/drawer';

type SettingsGroupProps = PropsWithChildren<{ title?: string }>;

export function SettingsGroup(props: SettingsGroupProps) {
  const { title, children } = props;

  return (
    <section className="flex flex-col gap-2">
      {title && <h2 className="text-muted-foreground px-4 text-xs font-semibold uppercase tracking-wider">{title}</h2>}
      <div className="bg-card divide-border border-border divide-y overflow-hidden rounded-2xl border">{children}</div>
    </section>
  );
}

type SettingsRowProps = PropsWithChildren<{
  Icon: LucideIcon;
  label: string;
  description?: ReactNode;
  // Rendered on the right side of the row, next to the label.
  trailing?: ReactNode;
  onClick?: () => void;
  destructive?: boolean;
  disabled?: boolean;
}>;

// A row with an onClick renders as a button with a chevron; otherwise it's a static container
// whose children (e.g. a picker) sit below the label.
export function SettingsRow(props: SettingsRowProps) {
  const { Icon, label, description, trailing, onClick, destructive, disabled, children } = props;

  const content = (
    <>
      <div className="flex items-center gap-3">
        <span
          className={cn(
            'flex size-8 shrink-0 items-center justify-center rounded-lg',
            destructive ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
          )}
        >
          <Icon className="size-4.5" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col text-left">
          <span className={cn('font-medium', destructive ? 'text-destructive' : 'text-foreground')}>{label}</span>
          {description && <span className="text-muted-foreground text-sm">{description}</span>}
        </span>
        {trailing && <span className="text-muted-foreground shrink-0 text-sm">{trailing}</span>}
        {onClick && <ChevronRight className="text-muted-foreground size-4 shrink-0" />}
      </div>
      {children && <div className="mt-3">{children}</div>}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="hover:bg-muted active:bg-muted focus-visible:ring-ring block w-full px-4 py-3 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-inset disabled:opacity-50"
      >
        {content}
      </button>
    );
  }

  return <div className={cn('px-4 py-3', disabled && 'opacity-50')}>{content}</div>;
}

type SegmentedControlProps<T extends string> = {
  label: string;
  value: T;
  options: { value: T; label: string; Icon?: LucideIcon }[];
  onChange: (value: T) => void;
};

export function SegmentedControl<T extends string>(props: SegmentedControlProps<T>) {
  const { label, value, options, onChange } = props;

  return (
    <div role="radiogroup" aria-label={label} className="bg-muted flex gap-1 rounded-xl p-1">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              'focus-visible:ring-ring flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg text-sm font-medium outline-none transition-colors focus-visible:ring-2',
              selected ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {option.Icon && <option.Icon className="size-4" />}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

type ConfirmDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
};

export function ConfirmDrawer(props: ConfirmDrawerProps) {
  const { open, onOpenChange, title, description, confirmLabel, onConfirm } = props;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent showHandle className="mx-auto max-w-md">
        <DrawerHeader>
          <DrawerTitle className="text-lg font-semibold">{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter className="pb-[max(1rem,env(safe-area-inset-bottom))]">
          <Button variant="destructive" size="lg" className="h-11 text-base" onClick={onConfirm}>
            {confirmLabel}
          </Button>
          <DrawerClose asChild>
            <Button variant="ghost" size="lg" className="h-11 text-base">
              Cancel
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
