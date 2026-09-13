import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
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
      <IngredientSection barId={barId} />
      <CocktailSection barId={barId} />
    </div>
  );
}
type IngredientListProps = { barId: string };
function IngredientSection(props: IngredientListProps) {
  const { barId } = props;
  const { isPending, error, data, isFetching } = useIngredientList(barId);
  const navigate = useNavigate();

  if (isPending) return <div>Loading...</div>;
  if (error) return <div>Error</div>;

  return (
    <div>
      <h1>Ingredients</h1>
      <div onClick={() => navigate(`/bar/${barId}/ingredients`)}>All</div>
    </div>
  );
}

type CocktailListProps = { barId: string };
function CocktailSection(props: CocktailListProps) {
  const { barId } = props;
  const { isPending, error, data, isFetching } = useCocktailList(barId);
  const navigate = useNavigate();

  if (isPending) return <div>Loading...</div>;
  if (error) return <div>Error</div>;

  return (
    <div>
      <h1>Cocktails</h1>
      <div onClick={() => navigate(`/bar/${barId}/cocktails`)}>All</div>
    </div>
  );
}
