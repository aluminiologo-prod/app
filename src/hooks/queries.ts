import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getTransfer } from '../services/transfers.service';
import { getStores } from '../services/stores.service';
import { listCountries } from '../services/countries.service';
import { getPublicClientTypes } from '../services/client-types.service';
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

/**
 * Unauthenticated list of active client types for the public registration
 * wizard. Cached for 10 min so switching between wizard steps doesn't refetch.
 */
export function usePublicClientTypesList() {
  return useQuery({
    queryKey: ['client-types', 'public'],
    queryFn: getPublicClientTypes,
    staleTime: 10 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
}

function toFlagEmoji(code: string): string {
  const normalized = code.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(normalized)) return '';
  return [...normalized]
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join('');
}

export function useCountries() {
  return useQuery({
    queryKey: queryKeys.countries.lists(),
    queryFn: async () => (await listCountries()).items,
    staleTime: Infinity,
    gcTime: Infinity,
    select: (items) =>
      items.map((c) => ({
        ...c,
        flag_emoji: c.flag_emoji || toFlagEmoji(c.code),
      })),
  });
}
