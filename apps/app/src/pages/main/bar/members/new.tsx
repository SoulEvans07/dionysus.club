import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { z } from 'zod';

import { AddBarMemberDTO, BarRoleDAL } from '@repo/dtos';
import { useAddBarMember, useBar } from '~/queries/bar';
import { assignableRoles, roleLabels } from '~/utils/members';
import { fieldErrors, focusFirstError, type FieldErrors } from '~/utils/form';
import { controlClass } from '~/components/common';
import { Field } from '~/components/form/field';
import { FormLoading, FormScreen } from '~/components/form/form-screen';
import { Input } from '~/components/shadcn/input';
import { NativeSelect } from '~/components/native-select';

const Params = z.object({ barId: z.string() });

export function MemberAddScreen() {
  const params = useParams();
  const { barId } = useMemo(() => Params.parse(params), [params]);
  const navigate = useNavigate();
  const backTo = `/bar/${barId}/members`;

  const bar = useBar(barId);
  const add = useAddBarMember(barId);
  const roles = assignableRoles(bar.data?.role);

  const [email, setEmail] = useState('');
  const [role, setRole] = useState<BarRoleDAL>('member');
  const [errors, setErrors] = useState<FieldErrors>({});

  if (!bar.isSuccess) {
    return (
      <FormLoading title="Add member" backTo={backTo} what="bar" error={bar.isError} onRetry={() => bar.refetch()} />
    );
  }

  const submit = () => {
    const result = AddBarMemberDTO.safeParse({ email, role });
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
      <Field label="Email" htmlFor="email" error={errors.email} hint="They need a dionysus.club account.">
        <Input
          id="email"
          type="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          autoComplete="off"
          autoCapitalize="none"
          aria-invalid={!!errors.email}
          className={controlClass}
        />
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
