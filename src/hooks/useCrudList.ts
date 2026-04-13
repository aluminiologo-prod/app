import { useState, useCallback, useRef } from 'react';
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import type { PaginatedResponse } from '../types/common';

interface UseCrudListOptions<T, Q extends Record<string, unknown>> {
  entityKey: string;
  fetchFn: (params: Q & { page: number; limit: number }) => Promise<PaginatedResponse<T>>;
  defaultFilters: Q;
  limit?: number;
  staleTime?: number;
}

export function useCrudList<T, Q extends Record<string, unknown>>({
  entityKey,
  fetchFn,
  defaultFilters,
  limit = 20,
  staleTime = 30_000,
}: UseCrudListOptions<T, Q>) {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Q>(defaultFilters);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const queryClient = useQueryClient();

  const queryParams = { ...filters, page, limit };

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: [entityKey, 'list', queryParams],
    queryFn: () => fetchFn(queryParams as Q & { page: number; limit: number }),
    staleTime,
    placeholderData: keepPreviousData,
  });

  const items = data?.items ?? [];
  const pagination = data?.pagination;
  const total = pagination?.total ?? 0;
  const totalPages = pagination?.totalPages ?? 1;

  const handleFilterChange = useCallback((key: keyof Q, value: unknown) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setPage(1);
    }, key === 'search' ? 400 : 0);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(defaultFilters);
    setPage(1);
  }, [defaultFilters]);

  const hasActiveFilters = Object.entries(filters).some(
    ([k, v]) => v !== (defaultFilters as Record<string, unknown>)[k],
  );

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [entityKey, 'list'] });
    refetch();
  }, [queryClient, entityKey, refetch]);

  return {
    items,
    total,
    totalPages,
    page,
    setPage,
    filters,
    handleFilterChange,
    clearFilters,
    hasActiveFilters,
    loading: isLoading,
    fetching: isFetching,
    refresh,
    queryClient,
  };
}
