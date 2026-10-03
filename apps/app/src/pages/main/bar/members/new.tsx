import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { z } from 'zod';

import { AddBarMemberDTO, BarRoleDAL, type PublicUserDTO } from '@repo/dtos';
import { useAddBarMember, useBar, useBarMembers } from '~/queries/bar';
import { assignableRoles, roleLabels } from '~/utils/members';
import { fieldErrors, focusFirstError, type FieldErrors } from '~/utils/form';
import { controlClass } from '~/components/common';
import { Field } from '~/components/form/field';
import { FormLoading, FormScreen } from '~/components/form/form-screen';
import { NativeSelect } from '~/components/native-select';
import { UserPicker } from './_user-picker';

const Params = z.object({ barId: z.string() });

export function MemberAddScreen() {
  const params = useParams();
  const { barId } = useMemo(() => Params.parse(params), [params]);
  const navigate = useNavigate();
  const backTo = `/bar/${barId}/members`;

  const bar = useBar(barId);
  const add = useAddBarMember(barId);
  const roles = assignableRoles(bar.data?.role);
  const members = useBarMembers(barId);
  const memberIds = useMemo(() => new Set(members.data?.map((m) => m.userId)), [members.data]);

  const [user, setUser] = useState<PublicUserDTO | null>(null);
  const [role, setRole] = useState<BarRoleDAL>('member');
  const [errors, setErrors] = useState<FieldErrors>({});

  if (!bar.isSuccess) {
    return (
      <FormLoading title="Add member" backTo={backTo} what="bar" error={bar.isError} onRetry={() => bar.refetch()} />
    );
  }

  const submit = () => {
    const result = AddBarMemberDTO.safeParse({ userId: user?.id ?? '', role });
    if (!result.success) {
      const found = fieldErrors(result.error);
      setErrors(found);
      focusFirstError(found);
      return;
    }

    setErrors({});
    add.mutate(result.data, { onSuccess: () => navigate(backTo, { replace: true }) });
  };

  return (
    <FormScreen
      title="Add member"
      backTo={backTo}
      isSaving={add.isPending}
      error={add.error?.message}
      onSubmit={submit}
    >
      <Field label="Person" htmlFor="userId" error={errors.userId}>
        <UserPicker id="userId" value={user} onChange={setUser} memberIds={memberIds} invalid={!!errors.userId} />
      </Field>

      <Field label="Role" htmlFor="role" error={errors.role}>
        <NativeSelect
          id="role"
          value={role}
          onChange={(e) => setRole(BarRoleDAL.parse(e.target.value))}
          className={controlClass}
        >
          {roles.map((r) => (
            <option key={r} value={r}>
              {roleLabels[r].one}
            </option>
          ))}
        </NativeSelect>
      </Field>
    </FormScreen>
  );
}
