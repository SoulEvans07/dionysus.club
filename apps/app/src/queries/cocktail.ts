import { useQuery } from '@tanstack/react-query';
import { api } from '~/api';

export const cocktailListQuery = (barId: string) => ({
  queryKey: ['bars', barId, 'cocktails', 'list'],
  queryFn: () => api.cocktails.list(barId),
});

export function useCocktailList(barId: string) {
  return useQuery({ ...cocktailListQuery(barId) });
}
