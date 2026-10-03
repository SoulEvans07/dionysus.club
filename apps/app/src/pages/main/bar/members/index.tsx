import { useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { ChevronRight, CircleUser } from 'lucide-react';
import { z } from 'zod';

import { BarRole, canManageBarRole, GetBarMemberDTO } from '@repo/dtos';
import { cn } from '~/utils/classnames';
import { canInvite, groupByRole, roleLabels } from '~/utils/members';
import { useBar, useBarMembers } from '~/queries/bar';
import { useCurrentUser } from '~/queries/auth';
import { placeholders } from '~/data/placeholders';
import { ScreenFrame, focusRing } from '~/components/common';
import { BackButton } from '~/components/back-button';
import { NewLink } from '~/components/catalog/action-buttons';
import { ErrorState } from '~/components/catalog/state-message';
import { Photo } from '~/components/catalog/photo';
import { MemberSheet } from './_member-sheet';

const Params = z.object({ barId: z.string() });

export function MemberListScreen() {
  const params = useParams();
  const { barId } = useMemo(() => Params.parse(params), [params]);
  const { data: me } = useCurrentUser();
  const bar = useBar(barId);
  const canManage = (member: GetBarMemberDTO) => canManageBarRole(bar.data?.role, member.role);

  const list = useBarMembers(barId);
  // Looked up from the list so the sheet follows refetches (and closes once the member is gone).
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = list.data?.find((m) => m.userId === selectedId) ?? null;
  const groups = useMemo(
    () => groupByRole(list.isPending ? placeholders.members.list : (list.data ?? [])),
    [list.isPending, list.data]
  );

  return (
    <ScreenFrame className="z-100 border-l-8 border-slate-300 bg-slate-200 dark:border-slate-700 dark:bg-slate-950">
      <header className="sticky top-0 z-10 border-slate-300/80 bg-slate-200/80 backdrop-blur dark:border-slate-700/80 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 pb-3 pt-3">
          <BackButton fallback={`/bar/${barId}`} />
          <h1 className="-ml-2 mr-auto font-serif text-3xl tracking-tight">Members</h1>
          {canInvite(bar.data) && <NewLink to={`/bar/${barId}/members/new`} label="Add member" />}
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 pb-4 pt-2">
        {list.isError && <ErrorState what="members" onRetry={() => list.refetch()} />}
        {!list.isError && (
          <div className="flex flex-col gap-5">
            {groups.map(([role, items]) => (
              <MemberGroup
                key={role}
                role={role}
                items={items}
                meId={me?.id}
                skeleton={list.isPending}
                isSelectable={canManage}
                onSelect={(member) => setSelectedId(member.userId)}
              />
            ))}
          </div>
        )}
      </main>
      <MemberSheet barId={barId} member={selected} onClose={() => setSelectedId(null)} />
    </ScreenFrame>
  );
}

type MemberGroupProps = {
  role: BarRole;
  items: GetBarMemberDTO[];
  meId?: string;
  skeleton?: boolean;
  isSelectable: (member: GetBarMemberDTO) => boolean;
  onSelect: (member: GetBarMemberDTO) => void;
};
function MemberGroup(props: MemberGroupProps) {
  const { role, items, meId, skeleton, isSelectable, onSelect } = props;
  const label = roleLabels[role][items.length > 1 ? 'many' : 'one'];

  return (
    <section aria-label={label} className="flex flex-col gap-1.5">
      <h2
        aria-hidden
        className={cn('flex w-fit items-baseline gap-1.5 rounded-md px-1 font-serif text-xl leading-none', {
          skeleton,
        })}
      >
        <span className="text-slate-400 dark:text-slate-500">{label}</span>
        <span className="font-sans text-sm text-slate-400/80 dark:text-slate-500/80">{items.length}</span>
      </h2>
      <ul className="divide-y divide-slate-300/50 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:divide-slate-700/50 dark:border-slate-800 dark:bg-slate-900">
        {items.map((member) => (
          <li key={member.userId}>
            <MemberRow
              member={member}
              isMe={member.userId === meId}
              skeleton={skeleton}
              onSelect={!skeleton && isSelectable(member) ? () => onSelect(member) : undefined}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

type MemberRowProps = {
  member: GetBarMemberDTO;
  isMe?: boolean;
  skeleton?: boolean;
  onSelect?: VoidFunction; // Only set when the viewer may manage this member.
};
function MemberRow(props: MemberRowProps) {
  const { member, isMe, skeleton, onSelect } = props;
  const { user } = member;
  const Row = onSelect ? 'button' : 'div';

  return (
    <Row
      {...(onSelect && { type: 'button', onClick: onSelect })}
      className={cn(
        'flex w-full items-center gap-3 p-3 text-left',
        onSelect && [
          'transition-colors hover:bg-slate-200/60 active:bg-slate-200 dark:hover:bg-slate-800 dark:active:bg-slate-800/50',
          focusRing,
          'focus-visible:ring-inset focus-visible:ring-offset-0',
        ]
      )}
    >
      <Photo
        image={user.profileImage}
        fallback={CircleUser}
        alt=""
        className={cn('size-11 shrink-0 rounded-full', { skeleton })}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className={cn('flex min-w-0 items-center gap-2', { 'skeleton w-fit rounded-md': skeleton })}>
          <span className="truncate font-medium">{user.username}</span>
          {isMe && (
            <span className="shrink-0 rounded-full bg-slate-300/70 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-700/70 dark:text-slate-300">
              You
            </span>
          )}
        </div>
        <div
          className={cn('truncate text-sm text-slate-500 dark:text-slate-400', {
            'skeleton w-fit rounded-md': skeleton,
          })}
        >
          {user.email}
        </div>
      </div>
      {onSelect && <ChevronRight className="size-4 shrink-0 text-slate-400 dark:text-slate-500" />}
    </Row>
  );
}
