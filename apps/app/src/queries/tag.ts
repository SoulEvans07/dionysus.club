import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateTagDTO } from '@repo/dtos';
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

// Cocktails and ingredients embed their tags, so those go stale too.
function useInvalidateTags(barId: string) {
  const client = useQueryClient();
  return () =>
    Promise.all([
      client.invalidateQueries({ queryKey: tagListQuery(barId).queryKey }),
      client.invalidateQueries({ queryKey: ['bars', barId, 'ingredients'] }),
      client.invalidateQueries({ queryKey: ['bars', barId, 'cocktails'] }),
    ]);
}

export function useCreateTag(barId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTagDTO) => api.tags.create(barId, data),
    onSuccess: () => client.invalidateQueries({ queryKey: tagListQuery(barId).queryKey }),
  });
}

export function useUpdateTag(barId: string, id: string) {
  const invalidate = useInvalidateTags(barId);
  return useMutation({
    mutationFn: (data: CreateTagDTO) => api.tags.update(barId, { ...data, id }),
    onSuccess: invalidate,
  });
}

export function useDeleteTag(barId: string) {
  const invalidate = useInvalidateTags(barId);
  return useMutation({
    mutationFn: (id: string) => api.tags.remove(barId, id),
    onSuccess: invalidate,
  });
}
