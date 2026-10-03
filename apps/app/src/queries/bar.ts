import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UpdateBarDTO, UpdateBarVisibilityDTO } from '@repo/dtos';
import { api } from '~/api';
import { sidebarQuery } from './sidebar';

export const barGetQuery = (barId: string) => {
  return queryOptions({
    queryKey: ['bars', barId],
    queryFn: () => api.bars.get(barId),
  });
};

export function useBar(barId: string) {
  return useQuery({ ...barGetQuery(barId) });
}

export const barMemeberListQuery = (barId: string) => {
  return queryOptions({
    queryKey: ['bars', barId, 'members', 'list'],
    queryFn: () => api.bars.members.list(barId),
  });
};

export function useBarMembers(barId: string) {
  return useQuery({ ...barMemeberListQuery(barId) });
}

// The sidebar lists bars by name and logo, so it goes stale with the bar itself.
function useInvalidateBar(barId: string) {
  const client = useQueryClient();
  return () =>
    Promise.all([
      client.invalidateQueries({ queryKey: barGetQuery(barId).queryKey, exact: true }),
      client.invalidateQueries({ queryKey: sidebarQuery.queryKey }),
    ]);
}

export function useUpdateBar(barId: string) {
  const invalidate = useInvalidateBar(barId);
  return useMutation({
    mutationFn: (data: UpdateBarDTO) => api.bars.update(barId, data),
    onSuccess: invalidate,
  });
}

export function useSetBarVisibility(barId: string) {
  const invalidate = useInvalidateBar(barId);
  return useMutation({
    mutationFn: (data: UpdateBarVisibilityDTO) => api.bars.setVisibility(barId, data),
    onSuccess: invalidate,
  });
}
