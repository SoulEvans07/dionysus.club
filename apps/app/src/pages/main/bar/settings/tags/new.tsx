import { useMemo } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router';
import { z } from 'zod';

import { hasBarRole } from '@repo/dtos';
import { FormLoading } from '~/components/form/form-screen';
import { useBar } from '~/queries/bar';
import { useCreateTag } from '~/queries/tag';
import { TagForm } from './_form';

const Params = z.object({ barId: z.string() });

export function TagCreateScreen() {
  const params = useParams();
  const { barId } = useMemo(() => Params.parse(params), [params]);
  const navigate = useNavigate();

  const bar = useBar(barId);
  const create = useCreateTag(barId);
  const backTo = `/bar/${barId}/settings/tags`;

  if (!bar.data) {
    return (
      <FormLoading title="New tag" backTo={backTo} what="this bar" error={bar.isError} onRetry={() => bar.refetch()} />
    );
  }

  if (!hasBarRole(bar.data.role, 'admin')) return <Navigate to={backTo} replace />;

  return (
    <TagForm
      title="New tag"
      backTo={backTo}
      isSaving={create.isPending}
      error={create.error?.message}
      onSubmit={(data) => create.mutate(data, { onSuccess: () => navigate(backTo, { replace: true }) })}
    />
  );
}
