import { useMemo } from 'react';
import { useParams } from 'react-router';
import { z } from 'zod';
import { Store } from 'lucide-react';

import { hasBarRole } from '@repo/dtos';
import { BackButton } from '~/components/back-button';
import { ScreenFrame } from '~/components/common';
import { ErrorState } from '~/components/catalog/state-message';
import { useBar } from '~/queries/bar';
import { SettingsGroup, SettingsLink } from './_menu';

const Params = z.object({ barId: z.string() });

export function BarSettingsScreen() {
  const params = useParams();
  const { barId } = useMemo(() => Params.parse(params), [params]);
  const bar = useBar(barId);

  return (
    <ScreenFrame className="z-100 border-l-8 border-slate-300 bg-slate-200 dark:border-slate-700 dark:bg-slate-950">
      <header className="sticky top-0 z-10 bg-slate-200/80 backdrop-blur dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <BackButton fallback={`/bar/${barId}`} />
          <div className="flex min-w-0 flex-col">
            <h1 className="font-serif text-3xl tracking-tight">Settings</h1>
            {bar.data && <p className="truncate text-sm text-slate-500 dark:text-slate-400">{bar.data.name}</p>}
          </div>
        </div>
      </header>
      <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 pb-24 pt-2">
        {bar.isError && <ErrorState what="settings" onRetry={() => bar.refetch()} />}
        {bar.isPending && <div aria-hidden className="skeleton h-12 w-full rounded-2xl" />}
        {bar.data && hasBarRole(bar.data.role, 'bartender') && (
          <SettingsGroup title="Bar">
            <SettingsLink to={`/bar/${barId}/settings/info`} icon={Store} label="Bar info" value={bar.data.name} />
          </SettingsGroup>
        )}
      </main>
    </ScreenFrame>
  );
}
