import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { z } from 'zod';

import { useCreateIngredient } from '~/queries/ingredient';
import { IngredientForm } from './_form';

const Params = z.object({ barId: z.string() });

export function IngredientCreateScreen() {
  const params = useParams();
  const { barId } = useMemo(() => Params.parse(params), [params]);
  const navigate = useNavigate();

  const create = useCreateIngredient(barId);

  return (
    <IngredientForm
      barId={barId}
      title="New ingredient"
      backTo={`/bar/${barId}/ingredients`}
      isSaving={create.isPending}
      error={create.error?.message}
      onSubmit={(data) =>
        create.mutate(data, { onSuccess: ({ id }) => navigate(`/bar/${barId}/ingredients/${id}`, { replace: true }) })
      }
    />
  );
}
