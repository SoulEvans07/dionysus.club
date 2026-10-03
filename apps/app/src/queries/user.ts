import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query';
import { api } from '~/api';

// The API wants at least this many characters; shorter input doesn't search at all.
export const USER_SEARCH_MIN_LENGTH = 2;

export const userSearchQuery = (q: string) => {
  return queryOptions({
    queryKey: ['users', 'search', q],
    queryFn: () => api.users.search(q),
  });
};

export function useUserSearch(q: string) {
  const needle = q.trim();
  return useQuery({
    ...userSearchQuery(needle),
    enabled: needle.length >= USER_SEARCH_MIN_LENGTH,
    // Keeps the last results on screen while the next keystroke's search is in flight.
    placeholderData: keepPreviousData,
  });
}
