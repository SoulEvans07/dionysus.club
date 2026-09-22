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

  const { isPending, error, data } = useCocktail(barId, id);
  if (isPending) return <Frame>Loading {id}...</Frame>;
  if (error) return <Frame>Error</Frame>;

  return (
    <Frame>
      <button onClick={goBack}>Back</button>
      <h1>Cocktail</h1>
      <div>{id}</div>
      <div>{data.name}</div>
      <div>{data.description}</div>
      <div>Tags</div>
      <div>
        {data.tags.map((tag) => (
          <div key={tag.id} className="rounded-full" style={{ backgroundColor: tag.color }}>
            [{tag.namespace}:{tag.key}] {tag.name}
          </div>
        ))}
      </div>
      <div>Recipe</div>
      <div className="flex flex-col gap-2">
        {data.recipe.map((item) => (
          <div key={item.ingredient.id} className="flex flex-row gap-1">
            <div
              className="size-10 overflow-hidden rounded-md bg-slate-50 bg-cover bg-center"
              style={{ backgroundImage: `url(${item.ingredient.iconImage?.url})` }}
            />
            <div>{item.ingredient.name}</div>
            {item.isGarnish && <div className="text-muted">(garnish)</div>}
            {item.isOptional && <div className="text-muted">(optional)</div>}
            <div>{item.quantity}</div>
            <div>{item.unit}</div>
          </div>
        ))}
      </div>
    </Frame>
  );
}

const Frame = tw.div('z-200 absolute left-0 right-0 top-0 h-dvh w-dvw overflow-y-auto bg-slate-400');
