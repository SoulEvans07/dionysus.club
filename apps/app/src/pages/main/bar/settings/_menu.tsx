import { ChevronRight, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router';

import { focusRing } from '~/components/common';
import { cn } from '~/utils/classnames';

type SettingsGroupProps = React.PropsWithChildren<{ title: string }>;
export function SettingsGroup(props: SettingsGroupProps) {
  const { title, children } = props;

  return (
    <section className="flex flex-col gap-2">
      <h2 className="px-1 text-sm font-medium text-slate-500 dark:text-slate-400">{title}</h2>
      <div className="flex flex-col divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
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
