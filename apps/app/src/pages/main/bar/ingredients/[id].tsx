import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { z } from 'zod';

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

  const { isPending, error, data, isFetching } = useIngredient(barId, id);
  if (isPending) return <Frame>Loading {id}...</Frame>;
  if (error) return <Frame>Error</Frame>;

  return (
    <Frame>
      <button onClick={goBack}>Back</button>
      <h1>Ingredient</h1>
      <div>{id}</div>
      <div>{data.name}</div>
      <div>{data.description}</div>
      <div>{data.available ? 'Available' : 'Unavailable'}</div>
    </Frame>
  );
}

const Frame = tw.div('z-200 absolute left-0 right-0 top-0 h-dvh w-dvw overflow-y-auto bg-white');
