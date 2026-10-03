import { useMemo } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router';
import { z } from 'zod';

import { hasBarRole } from '@repo/dtos';
import { FormLoading } from '~/components/form/form-screen';
import { useBar } from '~/queries/bar';
import { useDeleteTag, useTagList, useUpdateTag } from '~/queries/tag';
import { TagForm } from './_form';

const Params = z.object({ barId: z.string(), id: z.string() });

export function TagEditScreen() {
  const params = useParams();
  const { barId, id } = useMemo(() => Params.parse(params), [params]);
  const navigate = useNavigate();

  const bar = useBar(barId);
  const tags = useTagList(barId);
  const update = useUpdateTag(barId, id);
  const remove = useDeleteTag(barId);
  const backTo = `/bar/${barId}/settings/tags`;

  const tag = tags.data?.find((t) => t.id === id);

  if (!bar.data || !tags.data) {
    return (
      <FormLoading
        title="Edit tag"
        backTo={backTo}
        what="this tag"
        error={bar.isError || tags.isError}
        onRetry={() => Promise.all([bar.refetch(), tags.refetch()])}
      />
    );
  }

  // Unknown ids and the system bar's defaults aren't editable from here.
  if (!tag || tag.barId !== barId || !hasBarRole(bar.data.role, 'admin')) {
    // Skip the redirect while a delete is in flight; its own onSuccess navigates away.
    if (remove.isPending || remove.isSuccess) return null;
    return <Navigate to={backTo} replace />;
  }

  return (
    <TagForm
      key={tag.id}
      title="Edit tag"
      backTo={backTo}
      initial={tag}
      isSaving={update.isPending}
      error={update.error?.message}
      onSubmit={(data) => update.mutate(data, { onSuccess: () => navigate(backTo, { replace: true }) })}
      onDelete={{
        isPending: remove.isPending,
        error: remove.error?.message,
        run: () => remove.mutate(id, { onSuccess: () => navigate(backTo, { replace: true }) }),
      }}
    />
  );
}
