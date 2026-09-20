import { queryOptions, useQuery } from '@tanstack/react-query';
import { api } from '~/api';
import { QueryParams } from '~/types/url';

export const ingredientListQuery = (barId: string, query?: QueryParams) => {
  return queryOptions({
    queryKey: ['bars', barId, 'ingredients', 'list', query],
    queryFn: () => api.ingredients.list(barId, query),
  });
};

export function useIngredientList(barId: string, query?: QueryParams) {
  return useQuery({ ...ingredientListQuery(barId, query) });
}

export const ingredientGetQuery = (barId: string, id: string) => {
  return queryOptions({
    queryKey: ['bars', barId, 'ingredients', id],
    queryFn: () => api.ingredients.get(barId, id),
  });
};

export function useIngredient(barId: string, id: string) {
  return useQuery({ ...ingredientGetQuery(barId, id) });
}
