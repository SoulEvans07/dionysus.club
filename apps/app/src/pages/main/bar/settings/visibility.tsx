import { useMemo } from 'react';
import { Navigate, useParams } from 'react-router';
import { z } from 'zod';
import { CircleAlert } from 'lucide-react';

import { BarVisibility, hasBarRole } from '@repo/dtos';
import { ErrorState } from '~/components/catalog/state-message';
import { useBar, useSetBarVisibility } from '~/queries/bar';
import { SettingsGroup, SettingsNote, SettingsOption, SettingsScreen } from './_menu';
import { visibilityOptions } from './_visibility';

const Params = z.object({ barId: z.string() });

export function BarVisibilityScreen() {
  const params = useParams();
  const { barId } = useMemo(() => Params.parse(params), [params]);
  const bar = useBar(barId);
  const setVisibility = useSetBarVisibility(barId);
  const backTo = `/bar/${barId}/settings`;

  const current = BarVisibility.safeParse(bar.data?.barType);
  if (bar.data && (!current.success || !hasBarRole(bar.data.role, 'bartender'))) {
    return <Navigate to={backTo} replace />;
  }

  const isOwner = hasBarRole(bar.data?.role, 'owner');
  const pending = setVisibility.isPending ? setVisibility.variables.barType : null;

  return (
    <SettingsScreen title="Visibility" subtitle={bar.data?.name} backTo={backTo}>
      {bar.isError && <ErrorState what="this bar" onRetry={() => bar.refetch()} />}
      {bar.isPending && <div aria-hidden className="skeleton h-32 w-full rounded-2xl" />}
      {bar.data && current.success && (
        <>
          {!isOwner && <SettingsNote>Only the owner can change the bar&apos;s visibility.</SettingsNote>}
          {setVisibility.isError && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-2xl border border-slate-900 bg-white px-4 py-3 dark:border-slate-100 dark:bg-slate-900"
            >
              <CircleAlert className="mt-0.5 size-5 shrink-0" />
              <div>
                <p className="font-medium">Couldn&apos;t change visibility</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{setVisibility.error.message}</p>
              </div>
            </div>
          )}
          <SettingsGroup title="Who can see this bar" role="radiogroup">
            {BarVisibility.options.map((option) => (
              <SettingsOption
                key={option}
                {...visibilityOptions[option]}
                selected={(pending ?? current.data) === option}
                isPending={pending === option}
                disabled={!isOwner || !!pending}
                onSelect={() => option !== current.data && setVisibility.mutate({ barType: option })}
              />
            ))}
          </SettingsGroup>
        </>
      )}
    </SettingsScreen>
  );
}
