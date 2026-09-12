import { useQuery } from '@tanstack/react-query';
import { IngredientDTO } from '@repo/dtos';
import { H1, H2 } from '~/components/common';

export function BarScreen() {
  const { isPending, error, data, isFetching } = useQuery({
    queryKey: ['ingredients'],
    queryFn: async () => {
      const response = await fetch('/api/ingredients/list');
      const data = await response.json();
      return IngredientDTO.array().parse(data);
    },
  });

  return (
    <div>
      <H1>Bar Screen</H1>
      <H2>Ingredients</H2>
      <div>
        {isPending && <span>Loading...</span>}
        {error && <span className="text-rose-500">Error occured!</span>}
        {isFetching && <span>Updating...</span>}
        {data?.map((ingr) => (
          <div key={ingr.id} className="p-2">
            <div>{ingr.name}</div>
            <div>{ingr.description}</div>
            <div>{ingr.available ? 'Available' : 'Unavailable'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
