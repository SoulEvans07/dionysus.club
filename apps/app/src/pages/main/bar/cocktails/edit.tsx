import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { z } from 'zod';

import { FormLoading } from '~/components/form/form-screen';
import { useCocktail, useUpdateCocktail } from '~/queries/cocktail';
import { CocktailForm } from './_form';

const Params = z.object({ barId: z.string(), id: z.string() });

export function CocktailEditScreen() {
  const params = useParams();
  const { barId, id } = useMemo(() => Params.parse(params), [params]);
  const navigate = useNavigate();

  const cocktail = useCocktail(barId, id);
  const update = useUpdateCocktail(barId, id);
  const backTo = `/bar/${barId}/cocktails/${id}`;

  if (!cocktail.data) {
    return (
      <FormLoading
        title="Edit cocktail"
        backTo={backTo}
        what="this cocktail"
        error={cocktail.isError}
        onRetry={() => cocktail.refetch()}
      />
    );
  }

  return (
    <CocktailForm
      key={cocktail.data.id}
      barId={barId}
      title="Edit cocktail"
      backTo={backTo}
      initial={cocktail.data}
      isSaving={update.isPending}
      error={update.error?.message}
      onSubmit={(data) => update.mutate(data, { onSuccess: () => navigate(backTo, { replace: true }) })}
    />
  );
}
