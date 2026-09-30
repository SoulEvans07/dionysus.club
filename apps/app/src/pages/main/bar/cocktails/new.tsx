import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { z } from 'zod';

import { useCreateCocktail } from '~/queries/cocktail';
import { CocktailForm } from './_form';

const Params = z.object({ barId: z.string() });

export function CocktailCreateScreen() {
  const params = useParams();
  const { barId } = useMemo(() => Params.parse(params), [params]);
  const navigate = useNavigate();

  const create = useCreateCocktail(barId);

  return (
    <CocktailForm
      barId={barId}
      title="New cocktail"
      backTo={`/bar/${barId}/cocktails`}
      isSaving={create.isPending}
      error={create.error?.message}
      onSubmit={(data) =>
        create.mutate(data, { onSuccess: ({ id }) => navigate(`/bar/${barId}/cocktails/${id}`, { replace: true }) })
      }
    />
  );
}
