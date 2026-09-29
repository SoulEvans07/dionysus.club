import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { z } from 'zod';
import { ScreenFrame } from '~/components/common';

import { useIngredient } from '~/queries/ingredient';
import { tw } from '~/utils/twElem';

const Params = z.object({
  barId: z.string(),
  id: z.string(),
});

export function IngredientScreen() {
  const params = useParams();
  const { barId, id } = useMemo(() => Params.parse(params), [params]);

  const navigate = useNavigate();
  const goBack = () => navigate(-1);

  const { isPending, error, data } = useIngredient(barId, id);
  if (isPending) return <ScreenFrame className="z-200">Loading {id}...</ScreenFrame>;
  if (error) return <ScreenFrame className="z-200">Error</ScreenFrame>;

  return (
    <ScreenFrame className="z-200">
      <button onClick={goBack}>Back</button>
      <h1>Ingredient</h1>
      <div>{id}</div>
      <div>{data.name}</div>
      <div>{data.description}</div>
      <div>{data.available ? 'Available' : 'Unavailable'}</div>
    </ScreenFrame>
  );
}
