import { useQuery } from '@tanstack/react-query';
import { api } from '~/api';

export const barGetQuery = (barId: string) => ({
  queryKey: ['bars', barId],
  queryFn: () => api.bars.get(barId),
});

export function useBar(barId: string) {
  return useQuery({ ...barGetQuery(barId) });
}

export const barMemeberListQuery = (barId: string) => ({
  queryKey: ['bars', barId, 'members', 'list'],
  queryFn: () => api.bars.members.list(barId),
});

export function useBarMembers(barId: string) {
  return useQuery({ ...barMemeberListQuery(barId) });
}
