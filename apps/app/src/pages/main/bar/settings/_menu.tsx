import { Check, ChevronRight, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router';

import { BackButton } from '~/components/back-button';
import { focusRing, ScreenFrame } from '~/components/common';
import { Spinner } from '~/components/shadcn/spinner';
import { cn } from '~/utils/classnames';

type SettingsScreenProps = React.PropsWithChildren<{
  title: string;
  subtitle?: string;
  backTo: string;
}>;
export function SettingsScreen(props: SettingsScreenProps) {
  const { title, subtitle, backTo, children } = props;

  return (
    <ScreenFrame className="z-100 border-l-8 border-slate-300 bg-slate-200 dark:border-slate-700 dark:bg-slate-950">
      <header className="sticky top-0 z-10 bg-slate-200/80 backdrop-blur dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <BackButton fallback={backTo} />
          <div className="flex min-w-0 flex-col">
            <h1 className="font-serif text-3xl tracking-tight">{title}</h1>
            {subtitle && <p className="truncate text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
          </div>
        </div>
      </header>
      <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 pb-24 pt-2">{children}</main>
    </ScreenFrame>
  );
}

// Shown above settings the viewer can see but not change.
export function SettingsNote(props: React.PropsWithChildren) {
  return (
    <p className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
      {props.children}
    </p>
  );
}

type SettingsGroupProps = React.PropsWithChildren<{ title: string; role?: React.AriaRole }>;
export function SettingsGroup(props: SettingsGroupProps) {
  const { title, role, children } = props;

  return (
    <section className="flex flex-col gap-2">
      <h2 className="px-1 text-sm font-medium text-slate-500 dark:text-slate-400">{title}</h2>
      <div
        role={role}
        aria-label={role ? title : undefined}
        className="flex flex-col divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900"
      >
        {children}
      </div>
    </section>
  );
}

type SettingsLinkProps = {
  to: string;
  icon: LucideIcon;
  label: string;
  value?: string; // Current value, shown dimmed before the chevron.
};
export function SettingsLink(props: SettingsLinkProps) {
  const { to, icon: Icon, label, value } = props;

  return (
    <Link
      to={to}
      className={cn(
        'flex min-h-12 items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-50 active:bg-slate-100 dark:hover:bg-slate-800/60 dark:active:bg-slate-800',
        focusRing
      )}
    >
      <Icon className="size-5 shrink-0 text-slate-500 dark:text-slate-400" />
      <span className="font-medium">{label}</span>
      {value && <span className="ml-auto truncate text-slate-500 dark:text-slate-400">{value}</span>}
      <ChevronRight className={cn('size-4 shrink-0 text-slate-400 dark:text-slate-500', { 'ml-auto': !value })} />
    </Link>
  );
}

type SettingsOptionProps = {
  icon: LucideIcon;
  label: string;
  description: string;
  selected: boolean;
  isPending?: boolean;
  disabled?: boolean;
  onSelect: () => void;
};
// One choice in a single-select group; use inside a SettingsGroup with role="radiogroup".
export function SettingsOption(props: SettingsOptionProps) {
  const { icon: Icon, label, description, selected, isPending, disabled, onSelect } = props;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        'flex items-center gap-3 px-4 py-3 text-left transition-colors enabled:hover:bg-slate-50 enabled:active:bg-slate-100 disabled:cursor-default dark:enabled:hover:bg-slate-800/60 dark:enabled:active:bg-slate-800',
        focusRing
      )}
    >
      <Icon className="size-5 shrink-0 text-slate-500 dark:text-slate-400" />
      <div className="flex min-w-0 flex-col">
        <span className="font-medium">{label}</span>
        <span className="text-sm text-slate-500 dark:text-slate-400">{description}</span>
      </div>
      <span className="ml-auto grid size-5 shrink-0 place-items-center">
        {isPending ? <Spinner className="size-4" /> : selected && <Check className="size-5" />}
      </span>
    </button>
  );
}
