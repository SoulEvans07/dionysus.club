import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { z } from 'zod';

import { useCocktail } from '~/queries/cocktail';
import { tw } from '~/utils/twElem';

const Params = z.object({
  barId: z.string(),
  id: z.string(),
});

export function CocktailScreen() {
  const params = useParams();
  const { barId, id } = useMemo(() => Params.parse(params), [params]);

  const navigate = useNavigate();
  const goBack = () => navigate(-1);

  const { isPending, error, data, isFetching } = useCocktail(barId, id);
  if (isPending) return <Frame>Loading {id}...</Frame>;
  if (error) return <Frame>Error</Frame>;

  return (
    <Frame>
      <button onClick={goBack}>Back</button>
      <h1>Cocktail</h1>
      <div>{id}</div>
      <div>{data.name}</div>
      <div>{data.description}</div>
    </Frame>
  );
}

const Frame = tw.div('z-200 absolute left-0 right-0 top-0 h-dvh w-dvw overflow-y-auto bg-white');
