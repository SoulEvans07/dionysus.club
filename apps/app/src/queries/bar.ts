import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateBarDTO } from '@repo/dtos';
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

// A new bar shows up in the sidebar's "Owned" group, so that has to refetch too.
export function useCreateBar() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBarDTO) => api.bars.create(data),
    onSuccess: () => client.invalidateQueries({ queryKey: sidebarQuery.queryKey }),
  });
}
