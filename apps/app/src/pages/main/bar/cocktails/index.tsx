import { useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { z } from 'zod';

import { useCocktailList } from '~/queries/cocktail';
import { tw } from '~/utils/twElem';

const Params = z.object({ barId: z.string() });
const QueryParams = z.object({ tag: z.string().optional() });

export function CocktailListScreen() {
  const params = useParams();
  const { barId } = useMemo(() => Params.parse(params), [params]);
  const [query] = useSearchParams();
  const { tag } = useMemo(() => QueryParams.parse(Object.fromEntries(query.entries())), [query]);

  const navigate = useNavigate();
  const goBack = () => navigate(-1);

  const { isPending, error, data } = useCocktailList(barId, { tag });

  if (isPending) return <Frame>Loading...</Frame>;
  if (error) return <Frame>Error</Frame>;

  return (
    <Frame>
      <button onClick={goBack}>Back</button>
      <h1>Cocktails</h1>
      {data.map((cocktail) => (
        <div key={cocktail.id} className="p-2" onClick={() => navigate(`/bar/${barId}/cocktails/${cocktail.id}`)}>
          <div>{cocktail.name}</div>
          <div>{cocktail.description}</div>
        </div>
      ))}
    </Frame>
  );
}

const Frame = tw.div('z-100 absolute left-0 right-0 top-0 h-dvh w-dvw overflow-y-auto bg-white');
