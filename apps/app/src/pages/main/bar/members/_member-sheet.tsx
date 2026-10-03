import { useMemo, useState } from 'react';
import { Check, CircleAlert, CircleUser, UserMinus } from 'lucide-react';
import { useMediaQuery } from '@uidotdev/usehooks';

import type { BarRole, BarRoleDAL, GetBarMemberDTO } from '@repo/dtos';
import { cn } from '~/utils/classnames';
import { assignableRoles, roleLabels } from '~/utils/members';
import { useRemoveBarMember, useUpdateBarMemberRole } from '~/queries/bar';
import { focusRing } from '~/components/common';
import { Photo } from '~/components/catalog/photo';
import { Button } from '~/components/shadcn/button';
import { Spinner } from '~/components/shadcn/spinner';
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from '~/components/shadcn/drawer';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '~/components/shadcn/sheet';

type MemberSheetProps = {
  barId: string;
  actorRole?: BarRole; // The viewer's role, deciding which roles they can hand out.
  member: GetBarMemberDTO | null; // The sheet is open while a member is set.
  onClose: VoidFunction;
};
export function MemberSheet(props: MemberSheetProps) {
  const { barId, actorRole, member, onClose } = props;
  const isMobile = useMediaQuery('(max-width: 640px)');

  // Keeps the last member rendered while the sheet animates closed.
  const [shown, setShown] = useState(member);
  if (member && member !== shown) setShown(member);

  const { Root, Content, Title, Description } = useMemo(() => {
    if (isMobile) return { Root: Drawer, Content: DrawerContent, Title: DrawerTitle, Description: DrawerDescription };
    return { Root: Sheet, Content: SheetContent, Title: SheetTitle, Description: SheetDescription };
  }, [isMobile]);

  return (
    <Root open={!!member} onOpenChange={(open) => !open && onClose()}>
      <Content className="border-none bg-slate-200 dark:bg-slate-900">
        {shown && (
          // Keyed so a confirm left open for one member doesn't carry over to the next.
          <MemberActions key={shown.userId} barId={barId} actorRole={actorRole} member={shown} onDone={onClose}>
            <Title className="truncate font-serif text-2xl tracking-tight">{shown.user.username}</Title>
            <Description className="truncate text-sm text-slate-500 dark:text-slate-400">
              {shown.user.email} · {roleLabels[shown.role].one}
            </Description>
          </MemberActions>
        )}
      </Content>
    </Root>
  );
}

type MemberActionsProps = React.PropsWithChildren<{
  barId: string;
  actorRole?: BarRole;
  member: GetBarMemberDTO;
  onDone: VoidFunction;
}>;
function MemberActions(props: MemberActionsProps) {
  const { barId, actorRole, member, onDone, children } = props;
  const [confirming, setConfirming] = useState(false);
  const remove = useRemoveBarMember(barId);
  const update = useUpdateBarMemberRole(barId);
  const error = remove.error ?? update.error;

  const confirmRemove = () => remove.mutate(member.userId, { onSuccess: onDone });
  const changeRole = (role: BarRoleDAL) => {
    if (role !== member.role) update.mutate({ userId: member.userId, role });
  };

  return (
    <div className="flex flex-col gap-5 p-4 pb-8">
      <div className="flex items-center gap-3 pr-8">
        <Photo image={member.user.profileImage} fallback={CircleUser} className="size-14 shrink-0 rounded-full" />
        <div className="flex min-w-0 flex-col gap-0.5">{children}</div>
      </div>

      <RolePicker
        roles={assignableRoles(actorRole)}
        value={member.role}
        pending={update.isPending ? update.variables.role : undefined}
        onChange={changeRole}
      />

      {error && (
        <p role="alert" className="flex items-center gap-1.5 text-sm font-medium">
          <CircleAlert className="size-4 shrink-0" />
          {error.message}
        </p>
      )}

      {confirming ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-950">
          <p className="text-sm">
            Remove <span className="font-medium">{member.user.username}</span> from this bar? They lose access right
            away and you&apos;d have to add them again.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" className="h-10 rounded-xl px-4" onClick={() => setConfirming(false)}>
              Cancel
            </Button>
            <Button
              disabled={remove.isPending}
              onClick={confirmRemove}
              className="h-10 rounded-xl bg-slate-900 px-4 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
            >
              {remove.isPending && <Spinner className="size-4" />}
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          onClick={() => setConfirming(true)}
          className="h-11 justify-start gap-2 rounded-xl border-slate-300 bg-white px-4 dark:border-slate-700 dark:bg-slate-950"
        >
          <UserMinus className="size-4" />
          Remove from bar
        </Button>
      )}
    </div>
  );
}

type RolePickerProps = {
  roles: BarRoleDAL[];
  value: BarRole;
  pending?: BarRoleDAL; // The role being saved, if any.
  onChange: (role: BarRoleDAL) => void;
};
function RolePicker(props: RolePickerProps) {
  const { roles, value, pending, onChange } = props;

  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="mb-1.5 px-1 text-sm font-medium text-slate-500 dark:text-slate-400">Role</legend>
      <div
        role="radiogroup"
        className="divide-y divide-slate-300/50 overflow-hidden rounded-2xl border border-slate-300 bg-white dark:divide-slate-700/50 dark:border-slate-700 dark:bg-slate-950"
      >
        {roles.map((role) => {
          const checked = role === value;
          return (
            <button
              key={role}
              type="button"
              role="radio"
              aria-checked={checked}
              disabled={!!pending}
              onClick={() => onChange(role)}
              className={cn(
                'flex h-11 w-full items-center gap-3 px-4 text-left transition-colors hover:bg-slate-100 active:bg-slate-200/60 disabled:opacity-70 dark:hover:bg-slate-900 dark:active:bg-slate-800/60',
                focusRing,
                'focus-visible:ring-inset focus-visible:ring-offset-0',
                { 'font-medium': checked }
              )}
            >
              <span className="mr-auto">{roleLabels[role].one}</span>
              {pending === role ? <Spinner className="size-4" /> : checked && <Check className="size-4" />}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
