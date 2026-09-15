import { queryOptions, useQuery } from '@tanstack/react-query';
import { api } from '~/api';

export const cocktailListQuery = (barId: string) => {
  return queryOptions({
    queryKey: ['bars', barId, 'cocktails', 'list'],
    queryFn: () => api.cocktails.list(barId),
  });
};

export function useCocktailList(barId: string) {
  return useQuery({ ...cocktailListQuery(barId) });
}

export const cocktailGetQuery = (barId: string, id: string) => {
  return queryOptions({
    queryKey: ['bars', barId, 'cocktails', id],
    queryFn: () => api.cocktails.get(barId, id),
  });
};

export function useCocktail(barId: string, id: string) {
  return useQuery({ ...cocktailGetQuery(barId, id) });
}
