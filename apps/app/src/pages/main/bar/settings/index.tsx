import { useMemo } from 'react';
import { useParams } from 'react-router';
import { z } from 'zod';
import { Store } from 'lucide-react';

import { BarVisibility, hasBarRole } from '@repo/dtos';
import { ErrorState } from '~/components/catalog/state-message';
import { useBar } from '~/queries/bar';
import { SettingsGroup, SettingsLink, SettingsScreen } from './_menu';
import { visibilityOptions } from './_visibility';

const Params = z.object({ barId: z.string() });

export function BarSettingsScreen() {
  const params = useParams();
  const { barId } = useMemo(() => Params.parse(params), [params]);
  const bar = useBar(barId);

  const visibility = BarVisibility.safeParse(bar.data?.barType);

  return (
    <SettingsScreen title="Settings" subtitle={bar.data?.name} backTo={`/bar/${barId}`}>
      {bar.isError && <ErrorState what="settings" onRetry={() => bar.refetch()} />}
      {bar.isPending && <div aria-hidden className="skeleton h-12 w-full rounded-2xl" />}
      {bar.data && hasBarRole(bar.data.role, 'bartender') && (
        <SettingsGroup title="Bar">
          <SettingsLink to={`/bar/${barId}/settings/info`} icon={Store} label="Bar info" value={bar.data.name} />
          {visibility.success && (
            <SettingsLink
              to={`/bar/${barId}/settings/visibility`}
              icon={visibilityOptions[visibility.data].icon}
              label="Visibility"
              value={visibilityOptions[visibility.data].label}
            />
          )}
        </SettingsGroup>
      )}
    </SettingsScreen>
  );
}
