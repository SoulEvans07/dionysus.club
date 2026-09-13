import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { z } from 'zod';

import { useIngredientList } from '~/queries/ingredient';
import { tw } from '~/utils/twElem';

const Params = z.object({ barId: z.string() });

export function IngredientListScreen() {
  const params = useParams();
  const { barId } = useMemo(() => Params.parse(params), [params]);

  const navigate = useNavigate();
  const goBack = () => navigate(-1);

  const { isPending, error, data, isFetching } = useIngredientList(barId);
  if (isPending) return <Frame>Loading...</Frame>;
  if (error) return <Frame>Error</Frame>;

  return (
    <Frame>
      <button onClick={goBack}>Back</button>
      <h1>Ingredients</h1>
      {data.map((ingr) => (
        <div key={ingr.id} className="p-2" onClick={() => navigate(`/bar/${barId}/ingredients/${ingr.id}`)}>
          <div>{ingr.name}</div>
          <div>{ingr.description}</div>
          <div>{ingr.available ? 'Available' : 'Unavailable'}</div>
        </div>
      ))}
    </Frame>
  );
}

const Frame = tw.div('z-100 absolute left-0 right-0 top-0 h-dvh w-dvw overflow-y-auto bg-white');
