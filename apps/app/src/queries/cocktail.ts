import { queryOptions, useQuery } from '@tanstack/react-query';
import { api } from '~/api';
import { QueryParams } from '~/types/url';

export const cocktailListQuery = (barId: string, query?: QueryParams) => {
  return queryOptions({
    queryKey: ['bars', barId, 'cocktails', 'list', query],
    queryFn: () => api.cocktails.list(barId, query),
  });
};

export function useCocktailList(barId: string, query?: QueryParams) {
  return useQuery({ ...cocktailListQuery(barId, query) });
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
