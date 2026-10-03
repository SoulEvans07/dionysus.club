import { useState } from 'react';
import { Check, ChevronRight, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router';

import { BackButton } from '~/components/back-button';
import { focusRing, ScreenFrame } from '~/components/common';
import { FieldError } from '~/components/form/field';
import { Spinner } from '~/components/shadcn/spinner';
import { cn } from '~/utils/classnames';

type SettingsScreenProps = React.PropsWithChildren<{
  title: string;
  subtitle?: string;
  backTo: string;
  action?: React.ReactNode; // Sits at the end of the header, e.g. an add button.
}>;
export function SettingsScreen(props: SettingsScreenProps) {
  const { title, subtitle, backTo, action, children } = props;

  return (
    <ScreenFrame className="z-100 border-l-8 border-slate-300 bg-slate-200 dark:border-slate-700 dark:bg-slate-950">
      <header className="sticky top-0 z-10 bg-slate-200/80 backdrop-blur dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <BackButton fallback={backTo} />
          <div className="flex min-w-0 flex-col">
            <h1 className="font-serif text-3xl tracking-tight">{title}</h1>
            {subtitle && <p className="truncate text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
          </div>
          {action && <div className="ml-auto">{action}</div>}
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

type ConfirmActionProps = {
  icon: LucideIcon;
  label: string;
  description: string; // Shown once the action is armed, explaining what will happen.
  confirmLabel: string;
  isPending?: boolean;
  error?: string | null;
  onConfirm: () => void;
};
// A destructive action that asks for confirmation in place rather than in a dialog.
export function ConfirmAction(props: ConfirmActionProps) {
  const { icon: Icon, label, description, confirmLabel, isPending, error, onConfirm } = props;
  const [armed, setArmed] = useState(false);

  if (!armed) {
    return (
      <button
        type="button"
        onClick={() => setArmed(true)}
        className={cn(
          'flex min-h-12 items-center gap-3 px-4 py-3 text-left font-medium transition-colors hover:bg-slate-50 active:bg-slate-100 dark:hover:bg-slate-800/60 dark:active:bg-slate-800',
          focusRing
        )}
      >
        <Icon className="size-5 shrink-0" />
        {label}
      </button>
    );
  }

  return (
    <div role="alert" className="flex flex-col gap-3 bg-slate-50 px-4 py-3 dark:bg-slate-800/60">
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 size-5 shrink-0" />
        <div className="flex flex-col gap-0.5">
          <p className="font-medium">{label}?</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>
          {error && <FieldError>{error}</FieldError>}
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={() => setArmed(false)}
          className={cn('h-10 rounded-xl px-4 font-medium hover:bg-slate-200 dark:hover:bg-slate-700', focusRing)}
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={onConfirm}
          className={cn(
            'flex h-10 items-center gap-2 rounded-xl bg-slate-900 px-4 font-medium text-white hover:bg-slate-800 disabled:opacity-70 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200',
            focusRing
          )}
        >
          {isPending && <Spinner className="size-4" />}
          {confirmLabel}
        </button>
      </div>
    </div>
  );
}
