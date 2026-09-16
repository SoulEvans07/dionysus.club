import { queryOptions, useQuery } from '@tanstack/react-query';
import { api } from '~/api';
import { sortTagByFullKey } from '~/utils/tags';

export const tagListQuery = (barId: string) => {
  return queryOptions({
    queryKey: ['bars', barId, 'tags', 'list'],
    queryFn: () => api.tags.list(barId),
  });
};

export function useTagList(barId: string) {
  return useQuery({ ...tagListQuery(barId) });
}

export function useIngredientTagList(barId: string) {
  return useQuery({
    ...tagListQuery(barId),
    select: (tags) => tags.filter((tag) => tag.type === 'ingredient' || tag.type === 'both').sort(sortTagByFullKey),
  });
}

export function useCocktailTagList(barId: string) {
  return useQuery({
    ...tagListQuery(barId),
    select: (tags) => tags.filter((tag) => tag.type === 'cocktail' || tag.type === 'both').sort(sortTagByFullKey),
  });
}
