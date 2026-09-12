import { useMemo } from 'react';
import { useParams } from 'react-router';
import { z } from 'zod';
import { H1 } from '~/components/common';
import { useCocktailList } from '~/queries/cocktail';
import { useIngredientList } from '~/queries/ingredient';

const Params = z.object({ barId: z.string() });

export function BarScreen() {
  const params = useParams();
  const { barId } = useMemo(() => Params.parse(params), [params]);

  return (
    <div>
      <H1>Bar Screen</H1>
      <IngredientList barId={barId} />
      <CocktailList barId={barId} />
    </div>
  );
}
type IngredientListProps = { barId: string };
function IngredientList(props: IngredientListProps) {
  const { barId } = props;
  const { isPending, error, data, isFetching } = useIngredientList(barId);

  if (isPending) return <div>Loading...</div>;
  if (error) return <div>Error</div>;

  return (
    <div>
      <h1>Ingredients</h1>
      {data.map((ingr) => (
        <div key={ingr.id} className="p-2">
          <div>{ingr.name}</div>
          <div>{ingr.description}</div>
          <div>{ingr.available ? 'Available' : 'Unavailable'}</div>
        </div>
      ))}
    </div>
  );
}

type CocktailListProps = { barId: string };
function CocktailList(props: CocktailListProps) {
  const { barId } = props;
  const { isPending, error, data, isFetching } = useCocktailList(barId);

  if (isPending) return <div>Loading...</div>;
  if (error) return <div>Error</div>;

  return (
    <div>
      <h1>Cocktails</h1>
      {data.map((cocktail) => (
        <div key={cocktail.id} className="p-2">
          <div>{cocktail.name}</div>
          <div>{cocktail.description}</div>
        </div>
      ))}
    </div>
  );
}
