import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { z } from 'zod';

import { FormLoading } from '~/components/form/form-screen';
import { useIngredient, useUpdateIngredient } from '~/queries/ingredient';
import { IngredientForm } from './_form';

const Params = z.object({ barId: z.string(), id: z.string() });

export function IngredientEditScreen() {
  const params = useParams();
  const { barId, id } = useMemo(() => Params.parse(params), [params]);
  const navigate = useNavigate();

  const ingredient = useIngredient(barId, id);
  const update = useUpdateIngredient(barId, id);
  const backTo = `/bar/${barId}/ingredients/${id}`;

  if (!ingredient.data) {
    return (
      <FormLoading
        title="Edit ingredient"
        backTo={backTo}
        what="this ingredient"
        error={ingredient.isError}
        onRetry={() => ingredient.refetch()}
      />
    );
  }

  return (
    <IngredientForm
      key={ingredient.data.id}
      barId={barId}
      title="Edit ingredient"
      backTo={backTo}
      initial={ingredient.data}
      isSaving={update.isPending}
      error={update.error?.message}
      onSubmit={(data) => update.mutate(data, { onSuccess: () => navigate(backTo, { replace: true }) })}
    />
  );
}
