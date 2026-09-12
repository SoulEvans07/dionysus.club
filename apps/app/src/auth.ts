import { useQuery } from '@tanstack/react-query';
import { UserDTO } from '@repo/dtos';

export const currentUserQueryKey = ['auth', 'me'];

export class UnauthorizedError extends Error {}

export function useCurrentUser() {
  return useQuery({
    queryKey: currentUserQueryKey,
    queryFn: async () => {
      const response = await fetch('/api/auth/me');

      if (response.status === 401) throw new UnauthorizedError();
      if (!response.ok) throw new Error('Failed to fetch current user');

      const data = await response.json();
      return UserDTO.parse(data.user);
    },
    retry: false,
  });
}
