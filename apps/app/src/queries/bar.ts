import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { TransferBarDTO, UpdateBarDTO, UpdateBarVisibilityDTO } from '@repo/dtos';
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

// Callers navigate away on success; the left bar's cached queries are left to garbage collection.
export function useLeaveBar(barId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: () => api.bars.members.leave(barId),
    onSuccess: () => client.invalidateQueries({ queryKey: sidebarQuery.queryKey }),
  });
}

// The caller's role and the member list both change hands.
export function useTransferBar(barId: string) {
  const client = useQueryClient();
  const invalidate = useInvalidateBar(barId);
  return useMutation({
    mutationFn: (data: TransferBarDTO) => api.bars.transfer(barId, data),
    onSuccess: () =>
      Promise.all([invalidate(), client.invalidateQueries({ queryKey: barMemeberListQuery(barId).queryKey })]),
  });
}

// Callers navigate away on success, like useLeaveBar.
export function useDeleteBar(barId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: () => api.bars.remove(barId),
    onSuccess: () => client.invalidateQueries({ queryKey: sidebarQuery.queryKey }),
  });
}
