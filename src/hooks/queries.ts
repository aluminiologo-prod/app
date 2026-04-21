import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import { getTransfer } from '../services/transfers.service';
import { getStores } from '../services/stores.service';
import { listCountries } from '../services/countries.service';
import { getPublicClientTypes } from '../services/client-types.service';
import {
  getMyClient,
  syncMyPhone,
  updateMyAddress,
  updateMyClientType,
  updateMyEmail,
  updateMyFiscalDoc,
  updateMyName,
  updateMyPersonType,
} from '../services/clients.service';
import type { Client } from '../types/client';
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

/**
 * Authenticated client profile. Mirrors the backend `GET /clients/me` and
 * feeds the whole mobile profile screen. Every mutation below hits its own
 * field-scoped endpoint and writes the updated Client back into this cache,
 * so the profile re-renders without an extra round-trip.
 */
export function useMyClient(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.myClient(),
    queryFn: getMyClient,
    staleTime: 60_000,
    enabled: options?.enabled !== false,
  });
}

function buildClientMutation<TPayload>(
  mutationFn: (payload: TPayload) => Promise<Client>,
) {
  return (
    queryClient: ReturnType<typeof useQueryClient>,
  ) => ({
    mutationFn,
    onSuccess: (client: Client) => {
      queryClient.setQueryData<Client>(queryKeys.myClient(), client);
    },
  });
}

export function useUpdateMyName() {
  const qc = useQueryClient();
  return useMutation(buildClientMutation(updateMyName)(qc));
}

export function useUpdateMyPersonType() {
  const qc = useQueryClient();
  return useMutation(buildClientMutation(updateMyPersonType)(qc));
}

export function useUpdateMyClientType() {
  const qc = useQueryClient();
  return useMutation(buildClientMutation(updateMyClientType)(qc));
}

export function useUpdateMyEmail() {
  const qc = useQueryClient();
  return useMutation(buildClientMutation(updateMyEmail)(qc));
}

export function useUpdateMyFiscalDoc() {
  const qc = useQueryClient();
  return useMutation(buildClientMutation(updateMyFiscalDoc)(qc));
}

export function useUpdateMyAddress() {
  const qc = useQueryClient();
  return useMutation(buildClientMutation(updateMyAddress)(qc));
}

/**
 * Runs AFTER Supabase OTP verification — the endpoint reads the verified
 * phone from auth.users server-side, so there's no payload to pass.
 */
export function useSyncMyPhone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: syncMyPhone,
    onSuccess: (client: Client) => {
      qc.setQueryData<Client>(queryKeys.myClient(), client);
    },
  });
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
