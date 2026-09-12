import { useQuery } from '@tanstack/react-query';
import { api } from '~/api';

export const ingredientListQuery = (barId: string) => ({
  queryKey: ['bars', barId, 'ingredients', 'list'],
  queryFn: () => api.ingredients.list(barId),
});

export function useIngredientList(barId: string) {
  return useQuery({ ...ingredientListQuery(barId) });
}
