import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, TextInput, Pressable, SafeAreaView,
  useColorScheme, Alert,
} from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Search, SlidersHorizontal, RefreshCw } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useCrudList } from '../../../src/hooks/useCrudList';
import { usePermissions } from '../../../src/hooks/usePermissions';
import { useStoresList } from '../../../src/hooks/queries';
import { getTransfers, dispatchTransfer, receiveTransfer } from '../../../src/services/transfers.service';
import { toastSuccess, toastApiError } from '../../../src/lib/toast';
import { TransferCardGrid } from '../../../src/components/transfers/TransferCardGrid';
import { TransferDetailSheet } from '../../../src/components/transfers/TransferDetailSheet';
import { TransferReceiveSheet } from '../../../src/components/transfers/TransferReceiveSheet';
import { FilterSheet } from '../../../src/components/ui/FilterSheet';
import { Colors } from '../../../src/theme/colors';
import { ModuleCode } from '../../../src/config/module-codes';
import type { Transfer, ReceiveTransferPayload } from '../../../src/types/transfer';

const ALL_STATUSES = 'DRAFT,IN_TRANSIT,RECEIVED,DISPATCHED';

interface InTransitFilters extends Record<string, unknown> {
  search: string;
  from_store_id: string;
  to_store_id: string;
  orderBy: string;
}

const defaultFilters: InTransitFilters = {
  search: '',
  from_store_id: '',
  to_store_id: '',
  orderBy: 'created_at:desc',
};

export default function InTransitScreen() {
  const { t } = useTranslation('transfers');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { hasPermission, isAdmin, noRole } = usePermissions();
  const canUpdate = noRole || isAdmin || hasPermission(ModuleCode.TRANSFERENCES, 'can_update');
  const queryClient = useQueryClient();

  // Inject statuses + today filters (mirrors web InTransitPage.tsx exactly)
  const fetchFn = useCallback(
    (params: InTransitFilters & { page: number; limit: number }) => {
      const today = new Date().toISOString().slice(0, 10);
      return getTransfers({
        ...params,
        statuses: ALL_STATUSES,
        dispatched_today: today,
        received_today: today,
      } as never);
    },
    [],
  );

  const crud = useCrudList<Transfer, InTransitFilters>({
    entityKey: 'in-transit',
    fetchFn,
    defaultFilters,
    staleTime: 15_000,
  });

  // Stores for filter sheet
  const { data: storesData } = useStoresList({ limit: 100 });
  const stores = storesData?.items ?? [];

  // Refresh tracking (same as web)
  const prevTotalRef = useRef<number | null>(null);
  const isRefreshingRef = useRef(false);
  const [refreshMsg, setRefreshMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isRefreshingRef.current) {
      prevTotalRef.current = crud.total;
      return;
    }
    if (!crud.fetching && prevTotalRef.current !== null) {
      const diff = crud.total - prevTotalRef.current;
      if (diff > 0) setRefreshMsg(t('inTransit.refreshNew', { count: diff }));
      else if (diff < 0) setRefreshMsg(t('inTransit.refreshRemoved', { count: Math.abs(diff) }));
      else setRefreshMsg(t('inTransit.refreshUpToDate'));
      prevTotalRef.current = crud.total;
      isRefreshingRef.current = false;
      const timer = setTimeout(() => setRefreshMsg(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [crud.total, crud.fetching, t]);

  function handleManualRefresh() {
    prevTotalRef.current = crud.total;
    isRefreshingRef.current = true;
    setRefreshMsg(null);
    crud.refresh();
  }

  // Detail sheet
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Receive sheet
  const [receiveTarget, setReceiveTarget] = useState<Transfer | null>(null);
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [receiveLoading, setReceiveLoading] = useState(false);

  // Filter sheet
  const [filterOpen, setFilterOpen] = useState(false);

  const handleOpenDetail = useCallback((t: Transfer) => {
    setDetailId(t.id);
    setDetailOpen(true);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setDetailOpen(false);
    setDetailId(null);
  }, []);

  const handleOpenReceive = useCallback((t: Transfer) => {
    setReceiveTarget(t);
    setReceiveOpen(true);
  }, []);

  const handleCloseReceive = useCallback(() => {
    setReceiveOpen(false);
    setReceiveTarget(null);
  }, []);

  const handleOpenFilter = useCallback(() => setFilterOpen(true), []);
  const handleCloseFilter = useCallback(() => setFilterOpen(false), []);

  const handleFilterApply = useCallback(
    (partial: Partial<InTransitFilters>) => {
      Object.entries(partial).forEach(([k, v]) =>
        crud.handleFilterChange(k as keyof InTransitFilters, v),
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [crud.handleFilterChange],
  );

  // Dispatch
  const openDispatchConfirm = useCallback((transfer: Transfer) => {
    Alert.alert(
      t('inTransit.confirmDispatchTitle'),
      t('inTransit.confirmDispatchMessage', { code: transfer.code }),
      [
        { text: t('inTransit.clearFilters'), style: 'cancel' },
        {
          text: t('inTransit.dispatch'),
          onPress: () => handleDispatch(transfer),
          style: 'default',
        },
      ],
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]);

  async function handleDispatch(transfer: Transfer) {
    const listQueryKey = ['in-transit', 'list'];
    const previousData = queryClient.getQueriesData({ queryKey: listQueryKey });

    // Optimistic update
    queryClient.setQueriesData<{ items: Transfer[]; pagination: unknown }>(
      { queryKey: listQueryKey },
      (old) => {
        if (!old) return old;
        return { ...old, items: old.items.map((item) =>
          item.id === transfer.id ? { ...item, status: 'IN_TRANSIT' as const } : item
        )};
      },
    );

    try {
      await dispatchTransfer(transfer.id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      toastSuccess(t('inTransit.dispatchSuccess'));
      crud.refresh();
    } catch (err) {
      for (const [key, data] of previousData) {
        queryClient.setQueryData(key, data);
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      toastApiError(err);
    }
  }

  async function handleReceive(payload: ReceiveTransferPayload) {
    if (!receiveTarget) return;
    setReceiveLoading(true);

    const listQueryKey = ['in-transit', 'list'];
    const previousData = queryClient.getQueriesData({ queryKey: listQueryKey });

    // Optimistic update
    queryClient.setQueriesData<{ items: Transfer[]; pagination: unknown }>(
      { queryKey: listQueryKey },
      (old) => {
        if (!old) return old;
        return { ...old, items: old.items.map((item) =>
          item.id === receiveTarget.id ? { ...item, status: 'RECEIVED' as const } : item
        )};
      },
    );
    setReceiveOpen(false);

    try {
      await receiveTransfer(receiveTarget.id, payload);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      toastSuccess(t('inTransit.receiveSuccess'));
      crud.refresh();
    } catch (err) {
      for (const [key, data] of previousData) {
        queryClient.setQueryData(key, data);
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      toastApiError(err);
    } finally {
      setReceiveLoading(false);
      setReceiveTarget(null);
    }
  }

  const bg = isDark ? '#0F1117' : '#F4F4F5';
  const headerBg = isDark ? '#18191F' : '#FFFFFF';
  const borderColor = isDark ? '#272831' : '#E4E4E7';
  const textColor = isDark ? '#ECEDEE' : '#11181C';
  const mutedColor = '#71717A';

  const hasActiveFilters = crud.filters.from_store_id || crud.filters.to_store_id || crud.filters.orderBy !== 'created_at:desc';

  // Memoised inline styles — only recomputed when the relevant variables change.
  const safeAreaStyle = useMemo(() => ({ backgroundColor: bg }), [bg]);
  const headerStyle = useMemo(
    () => ({ backgroundColor: headerBg, borderBottomColor: borderColor }),
    [headerBg, borderColor],
  );
  const filterBtnStyle = useMemo(
    () => ({
      borderColor: hasActiveFilters ? Colors.primary : borderColor,
      backgroundColor: hasActiveFilters ? Colors.primaryLight : 'transparent',
    }),
    [hasActiveFilters, borderColor],
  );

  return (
    <SafeAreaView className="flex-1" style={safeAreaStyle}>
      {/* Header */}
      <View
        className="border-b px-4 pt-2 pb-3"
        style={headerStyle}
      >
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-xl font-bold" style={{ color: textColor }}>
            {t('inTransit.title')}
          </Text>
          <View className="flex-row items-center gap-2">
            {!!refreshMsg && (
              <View className="bg-[#EBF1FF] rounded-full px-3 py-1">
                <Text className="text-xs font-medium text-primary" style={{ color: Colors.primary }}>
                  {refreshMsg}
                </Text>
              </View>
            )}
            <Pressable
              onPress={handleManualRefresh}
              className="w-8 h-8 rounded-xl items-center justify-center border active:opacity-70"
              style={{ borderColor }}
            >
              <RefreshCw size={16} color={mutedColor} />
            </Pressable>
          </View>
        </View>

        {/* Search + filter row */}
        <View className="flex-row items-center gap-2">
          <View
            className="flex-1 flex-row items-center rounded-xl px-3 py-2.5 border"
            style={{ backgroundColor: isDark ? '#1F2028' : '#F4F4F5', borderColor }}
          >
            <Search size={16} color={mutedColor} />
            <TextInput
              className="flex-1 ml-2 text-sm"
              style={{ color: textColor }}
              placeholder={t('inTransit.searchPlaceholder')}
              placeholderTextColor={mutedColor}
              value={crud.filters.search as string}
              onChangeText={(v) => crud.handleFilterChange('search', v)}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
          </View>
          <Pressable
            onPress={handleOpenFilter}
            className="w-10 h-10 rounded-xl items-center justify-center border active:opacity-70"
            style={filterBtnStyle}
          >
            <SlidersHorizontal size={18} color={hasActiveFilters ? Colors.primary : mutedColor} />
          </Pressable>
        </View>
      </View>

      {/* Transfer list */}
      <TransferCardGrid
        items={crud.items}
        isLoading={crud.loading}
        isFetching={crud.fetching}
        total={crud.total}
        canUpdate={canUpdate}
        onViewDetails={handleOpenDetail}
        onDispatch={openDispatchConfirm}
        onReceive={handleOpenReceive}
        onRefresh={crud.refresh}
      />

      {/* Bottom sheets */}
      <TransferDetailSheet
        transferId={detailId}
        isOpen={detailOpen}
        onClose={handleCloseDetail}
      />
      <TransferReceiveSheet
        transferId={receiveTarget?.id ?? null}
        isOpen={receiveOpen}
        isLoading={receiveLoading}
        onClose={handleCloseReceive}
        onConfirm={handleReceive}
      />
      <FilterSheet
        isOpen={filterOpen}
        onClose={handleCloseFilter}
        filters={crud.filters as InTransitFilters}
        stores={stores}
        onApply={handleFilterApply}
        onClear={crud.clearFilters}
      />
    </SafeAreaView>
  );
}
