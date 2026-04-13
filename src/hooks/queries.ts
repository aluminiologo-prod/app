import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getTransfer } from '../services/transfers.service';
import { getStores } from '../services/stores.service';
import { queryKeys } from '../lib/queryKeys';

export function useTransfer(id: string | null, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.transfers.detail(id ?? ''),
    queryFn: () => getTransfer(id!),
    enabled: !!id && (options?.enabled !== false),
    staleTime: 30_000,
  });
}

export function useStoresList(params?: { limit?: number }) {
  return useQuery({
    queryKey: queryKeys.stores.list(params ?? {}),
    queryFn: () => getStores({ limit: params?.limit ?? 100 }),
    staleTime: 10 * 60 * 1000, // 10 min
    placeholderData: keepPreviousData,
  });
}
