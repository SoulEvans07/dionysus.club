import { useQuery } from '@tanstack/react-query';
import { api } from '~/api';

export const currentUserQuery = {
  queryKey: ['auth', 'me'],
  queryFn: api.auth.me,
};

export function useCurrentUser() {
  return useQuery({
    ...currentUserQuery,
    retry: false,
  });
}
