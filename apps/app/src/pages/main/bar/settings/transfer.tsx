import { useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router';
import { z } from 'zod';
import { CircleUser, Crown } from 'lucide-react';

import { BarVisibility } from '@repo/dtos';
import { EmptyState, ErrorState } from '~/components/catalog/state-message';
import { useBar, useBarMembers, useTransferBar } from '~/queries/bar';
import { ConfirmAction, SettingsGroup, SettingsOption, SettingsScreen } from './_menu';

const Params = z.object({ barId: z.string() });

export function BarTransferScreen() {
  const params = useParams();
  const { barId } = useMemo(() => Params.parse(params), [params]);
  const navigate = useNavigate();
  const bar = useBar(barId);
  const members = useBarMembers(barId);
  const transfer = useTransferBar(barId);
  const backTo = `/bar/${barId}/settings`;

  const [userId, setUserId] = useState<string | null>(null);

  const candidates = useMemo(() => members.data?.filter((m) => m.role !== 'owner') ?? [], [members.data]);
  const selected = candidates.find((m) => m.userId === userId);

  // Once the transfer lands the viewer is an admin, so this screen no longer applies.
  if (bar.data && (bar.data.role !== 'owner' || !BarVisibility.safeParse(bar.data.barType).success)) {
    return <Navigate to={backTo} replace />;
  }

  const isPending = bar.isPending || members.isPending;

  return (
    <SettingsScreen title="Transfer ownership" subtitle={bar.data?.name} backTo={backTo}>
      {(bar.isError || members.isError) && (
        <ErrorState what="members" onRetry={() => Promise.all([bar.refetch(), members.refetch()])} />
      )}
      {isPending && <div aria-hidden className="skeleton h-32 w-full rounded-2xl" />}
      {!isPending && !members.isError && candidates.length === 0 && (
        <EmptyState title="No one to transfer to">Add someone to this bar first, then make them the owner.</EmptyState>
      )}
      {!isPending && candidates.length > 0 && (
        <>
          <SettingsGroup title="New owner" role="radiogroup">
            {candidates.map((member) => (
              <SettingsOption
                key={member.userId}
                icon={CircleUser}
                label={member.user.username}
                description={member.role}
                selected={member.userId === userId}
                disabled={transfer.isPending}
                onSelect={() => setUserId(member.userId)}
              />
            ))}
          </SettingsGroup>
          <SettingsGroup title="Confirm">
            <ConfirmAction
              key={userId}
              icon={Crown}
              label="Transfer ownership"
              description={
                selected
                  ? `${selected.user.username} becomes the owner. You'll stay on as an admin and can't undo this yourself.`
                  : ''
              }
              confirmLabel="Transfer"
              disabled={!selected}
              isPending={transfer.isPending}
              error={transfer.error?.message}
              onConfirm={() =>
                selected &&
                transfer.mutate({ userId: selected.userId }, { onSuccess: () => navigate(backTo, { replace: true }) })
              }
            />
          </SettingsGroup>
        </>
      )}
    </SettingsScreen>
  );
}
