import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query';
import type { DiscoverBarsQueryParams } from '@repo/dtos';
import { api } from '~/api';

export const barDiscoverQuery = (query?: DiscoverBarsQueryParams) => {
  return queryOptions({
    queryKey: ['bars', 'discover', query],
    queryFn: () => api.bars.discover(query),
  });
};

// Keeps the previous results on screen while a new search term loads.
export function useBarDiscovery(query?: DiscoverBarsQueryParams) {
  return useQuery({ ...barDiscoverQuery(query), placeholderData: keepPreviousData });
}

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
