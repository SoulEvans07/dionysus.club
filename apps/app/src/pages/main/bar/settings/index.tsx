import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { z } from 'zod';
import { LogOut, Store, Tags } from 'lucide-react';

import { BarVisibility, hasBarRole } from '@repo/dtos';
import { ErrorState } from '~/components/catalog/state-message';
import { useBar, useLeaveBar } from '~/queries/bar';
import { ConfirmAction, SettingsGroup, SettingsLink, SettingsScreen } from './_menu';
import { visibilityOptions } from './_visibility';

const Params = z.object({ barId: z.string() });

export function BarSettingsScreen() {
  const params = useParams();
  const { barId } = useMemo(() => Params.parse(params), [params]);
  const navigate = useNavigate();
  const bar = useBar(barId);
  const leave = useLeaveBar(barId);

  const visibility = BarVisibility.safeParse(bar.data?.barType);
  const isOwner = bar.data?.role === 'owner';

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
          <SettingsLink to={`/bar/${barId}/settings/tags`} icon={Tags} label="Tags" />
        </SettingsGroup>
      )}
      {bar.data && !isOwner && (
        <SettingsGroup title="Danger zone">
          <ConfirmAction
            icon={LogOut}
            label="Leave bar"
            description={`You'll lose access to ${bar.data.name} until someone adds you again.`}
            confirmLabel="Leave"
            isPending={leave.isPending}
            error={leave.error?.message}
            onConfirm={() => leave.mutate(undefined, { onSuccess: () => navigate('/bar', { replace: true }) })}
          />
        </SettingsGroup>
      )}
    </SettingsScreen>
  );
}
