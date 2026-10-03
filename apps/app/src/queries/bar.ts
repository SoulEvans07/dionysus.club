import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AddBarMemberDTO } from '@repo/dtos';
import { api } from '~/api';

export const barGetQuery = (barId: string) => {
  return queryOptions({
    queryKey: ['bars', barId],
    queryFn: () => api.bars.get(barId),
  });
};

export function useBar(barId: string) {
  return useQuery({ ...barGetQuery(barId) });
}

export const barMemberListQuery = (barId: string) => {
  return queryOptions({
    queryKey: ['bars', barId, 'members', 'list'],
    queryFn: () => api.bars.members.list(barId),
  });
};

export function useBarMembers(barId: string) {
  return useQuery({ ...barMemberListQuery(barId) });
}

function useInvalidateMembers(barId: string) {
  const client = useQueryClient();
  return () => client.invalidateQueries({ queryKey: ['bars', barId, 'members'] });
}

export function useAddBarMember(barId: string) {
  const invalidate = useInvalidateMembers(barId);
  return useMutation({
    mutationFn: (data: AddBarMemberDTO) => api.bars.members.add(barId, data),
    onSuccess: invalidate,
  });
}

export function useRemoveBarMember(barId: string) {
  const invalidate = useInvalidateMembers(barId);
  return useMutation({
    mutationFn: (userId: string) => api.bars.members.remove(barId, userId),
    onSuccess: invalidate,
  });
}
