import { useMemo, useState } from 'react';
import { CircleAlert, CircleUser, UserMinus } from 'lucide-react';
import { useMediaQuery } from '@uidotdev/usehooks';

import type { GetBarMemberDTO } from '@repo/dtos';
import { roleLabels } from '~/utils/members';
import { useRemoveBarMember } from '~/queries/bar';
import { Photo } from '~/components/catalog/photo';
import { Button } from '~/components/shadcn/button';
import { Spinner } from '~/components/shadcn/spinner';
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from '~/components/shadcn/drawer';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '~/components/shadcn/sheet';

type MemberSheetProps = {
  barId: string;
  member: GetBarMemberDTO | null; // The sheet is open while a member is set.
  onClose: VoidFunction;
};
export function MemberSheet(props: MemberSheetProps) {
  const { barId, member, onClose } = props;
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
          <MemberActions key={shown.userId} barId={barId} member={shown} onDone={onClose}>
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
  member: GetBarMemberDTO;
  onDone: VoidFunction;
}>;
function MemberActions(props: MemberActionsProps) {
  const { barId, member, onDone, children } = props;
  const [confirming, setConfirming] = useState(false);
  const remove = useRemoveBarMember(barId);

  const confirmRemove = () => remove.mutate(member.userId, { onSuccess: onDone });

  return (
    <div className="flex flex-col gap-5 p-4 pb-8">
      <div className="flex items-center gap-3 pr-8">
        <Photo image={member.user.profileImage} fallback={CircleUser} className="size-14 shrink-0 rounded-full" />
        <div className="flex min-w-0 flex-col gap-0.5">{children}</div>
      </div>

      {remove.error && (
        <p role="alert" className="flex items-center gap-1.5 text-sm font-medium">
          <CircleAlert className="size-4 shrink-0" />
          {remove.error.message}
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
