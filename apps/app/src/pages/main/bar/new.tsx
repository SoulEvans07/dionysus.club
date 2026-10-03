import { useNavigate } from 'react-router';

import { useCreateBar } from '~/queries/bar';
import { BarForm } from './_form';

export function BarCreateScreen() {
  const navigate = useNavigate();

  const create = useCreateBar();

  return (
    <BarForm
      title="New bar"
      backTo="/bar"
      isSaving={create.isPending}
      error={create.error?.message}
      onSubmit={(data) => create.mutate(data, { onSuccess: ({ id }) => navigate(`/bar/${id}`, { replace: true }) })}
    />
  );
}
