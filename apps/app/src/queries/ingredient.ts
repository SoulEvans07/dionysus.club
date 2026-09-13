import { useQuery } from '@tanstack/react-query';
import { api } from '~/api';

export const ingredientListQuery = (barId: string) => ({
  queryKey: ['bars', barId, 'ingredients', 'list'],
  queryFn: () => api.ingredients.list(barId),
});

export function useIngredientList(barId: string) {
  return useQuery({ ...ingredientListQuery(barId) });
}

export const ingredientGetQuery = (barId: string, id: string) => ({
  queryKey: ['bars', barId, 'ingredients', id],
  queryFn: () => api.ingredients.get(barId, id),
});

export function useIngredient(barId: string, id: string) {
  return useQuery({ ...ingredientGetQuery(barId, id) });
}
