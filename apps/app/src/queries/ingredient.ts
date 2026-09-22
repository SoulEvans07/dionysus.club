import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateIngredientDTO, IngredientDTO } from '@repo/dtos';
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

// Cocktail recipes embed their ingredients (name, stock), so those go stale too.
function useInvalidateIngredients(barId: string) {
  const client = useQueryClient();
  return () =>
    Promise.all([
      client.invalidateQueries({ queryKey: ['bars', barId, 'ingredients'] }),
      client.invalidateQueries({ queryKey: ['bars', barId, 'cocktails'] }),
    ]);
}

export function useCreateIngredient(barId: string) {
  const invalidate = useInvalidateIngredients(barId);
  return useMutation({
    mutationFn: (data: CreateIngredientDTO) => api.ingredients.create(barId, data),
    onSuccess: invalidate,
  });
}

export function useUpdateIngredient(barId: string, id: string) {
  const invalidate = useInvalidateIngredients(barId);
  return useMutation({
    mutationFn: (data: CreateIngredientDTO) => api.ingredients.update(barId, { ...data, id }),
    onSuccess: invalidate,
  });
}

// Optimistic so toggling from the list feels instant instead of waiting on a round-trip.
export function useSetIngredientAvailability(barId: string) {
  const client = useQueryClient();
  const invalidate = useInvalidateIngredients(barId);
  const listKey = ['bars', barId, 'ingredients', 'list'];

  return useMutation({
    mutationFn: ({ id, available }: { id: string; available: boolean }) =>
      api.ingredients.setAvailability(barId, id, available),
    onMutate: async ({ id, available }) => {
      await client.cancelQueries({ queryKey: listKey });

      const previous = client.getQueriesData<IngredientDTO[]>({ queryKey: listKey });
      client.setQueriesData<IngredientDTO[]>({ queryKey: listKey }, (old) =>
        old?.map((ingredient) => (ingredient.id === id ? { ...ingredient, available } : ingredient))
      );

      return { previous };
    },
    onError: (_err, _vars, context) => {
      context?.previous.forEach(([key, data]) => client.setQueryData(key, data));
    },
    onSettled: invalidate,
  });
}
