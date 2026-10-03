import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UpdateBarDTO } from '@repo/dtos';
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
export function useUpdateBar(barId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateBarDTO) => api.bars.update(barId, data),
    onSuccess: () =>
      Promise.all([
        client.invalidateQueries({ queryKey: barGetQuery(barId).queryKey, exact: true }),
        client.invalidateQueries({ queryKey: sidebarQuery.queryKey }),
      ]),
  });
}
