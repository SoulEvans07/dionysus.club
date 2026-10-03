import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AddBarMemberDTO, BarRoleDAL, GetBarMemberDTO } from '@repo/dtos';
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

export function useUpdateBarMemberRole(barId: string) {
  const client = useQueryClient();
  const invalidate = useInvalidateMembers(barId);
  const listKey = barMemberListQuery(barId).queryKey;

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: BarRoleDAL }) =>
      api.bars.members.update(barId, userId, { role }),
    // Moves the member into their new group right away; the refetch restores the server's ordering.
    onMutate: async ({ userId, role }) => {
      await client.cancelQueries({ queryKey: listKey });

      const previous = client.getQueryData<GetBarMemberDTO[]>(listKey);
      client.setQueryData<GetBarMemberDTO[]>(listKey, (old) =>
        old?.map((member) => (member.userId === userId ? { ...member, role } : member))
      );

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) client.setQueryData(listKey, context.previous);
    },
    onSettled: invalidate,
  });
}

export function useRemoveBarMember(barId: string) {
  const invalidate = useInvalidateMembers(barId);
  return useMutation({
    mutationFn: (userId: string) => api.bars.members.remove(barId, userId),
    onSuccess: invalidate,
  });
}
