import { queryOptions, useQuery } from '@tanstack/react-query';
import { api } from '~/api';

export const sidebarQuery = queryOptions({
  queryKey: ['sidebar', 'bars', 'list'],
  queryFn: api.sidebar.get,
});

export function useSidebarData() {
  return useQuery({ ...sidebarQuery });
}
