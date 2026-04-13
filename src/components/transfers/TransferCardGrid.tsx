import React, { useMemo, useCallback } from 'react';
import { SectionList, View, Text, ActivityIndicator, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { TransferCard } from './TransferCard';
import { EmptyState } from '../ui/EmptyState';
import { StatusChip } from '../ui/StatusChip';
import { Colors } from '../../theme/colors';
import type { Transfer, TransferStatus } from '../../types/transfer';

const STATUS_ORDER: TransferStatus[] = ['DRAFT', 'IN_TRANSIT', 'RECEIVED', 'DISPATCHED'];

const SECTION_KEY_MAP: Record<TransferStatus, string> = {
  DRAFT:      'inTransit.sectionDraft',
  IN_TRANSIT: 'inTransit.sectionInTransit',
  RECEIVED:   'inTransit.sectionReceived',
  DISPATCHED: 'inTransit.sectionDispatched',
  CANCELLED:  'inTransit.sectionDraft',
};

// Stable content container style — defined outside component to avoid
// creating a new object on every render.
const CONTENT_CONTAINER_STYLE = { paddingHorizontal: 16, paddingBottom: 32 };
const REFRESH_COLORS = [Colors.primary];

interface TransferSection {
  status: TransferStatus;
  title: string;
  data: Transfer[];
}

interface TransferCardGridProps {
  items: Transfer[];
  isLoading: boolean;
  isFetching: boolean;
  total: number;
  canUpdate: boolean;
  onViewDetails: (transfer: Transfer) => void;
  onDispatch: (transfer: Transfer) => void;
  onReceive: (transfer: Transfer) => void;
  onRefresh: () => void;
}

export function TransferCardGrid({
  items,
  isLoading,
  isFetching,
  total,
  canUpdate,
  onViewDetails,
  onDispatch,
  onReceive,
  onRefresh,
}: TransferCardGridProps) {
  const { t } = useTranslation('transfers');

  // Memoised grouping — only recomputes when items or translations change.
  const sections: TransferSection[] = useMemo(
    () =>
      STATUS_ORDER
        .map((status) => ({
          status,
          title: t(SECTION_KEY_MAP[status]),
          data: items.filter((item) => item.status === status),
        }))
        .filter((s) => s.data.length > 0),
    [items, t],
  );

  // Stable renderItem — only recreated when the action callbacks or canUpdate change.
  const renderItem = useCallback(
    ({ item }: { item: Transfer }) => (
      <TransferCard
        transfer={item}
        canUpdate={canUpdate}
        onViewDetails={onViewDetails}
        onDispatch={onDispatch}
        onReceive={onReceive}
      />
    ),
    [canUpdate, onViewDetails, onDispatch, onReceive],
  );

  // Stable renderSectionHeader.
  const renderSectionHeader = useCallback(
    ({ section }: { section: TransferSection }) => (
      <View className="flex-row items-center gap-2 pt-5 pb-3">
        <Text className="text-sm font-semibold text-[#31374A] dark:text-[#9BA1B0]">
          {section.title}
        </Text>
        <StatusChip status={section.status} label={String(section.data.length)} size="sm" />
      </View>
    ),
    [],
  );

  // Memoised footer — only updates when total changes.
  const ListFooterComponent = useMemo(
    () => (
      <Text className="text-xs text-[#71717A] text-center mt-2 mb-4">
        {t('inTransit.totalTransfers', { count: total })}
      </Text>
    ),
    [t, total],
  );

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center py-20">
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title={t('inTransit.noTransfersFound')}
        subtitle={t('inTransit.clearFilters')}
      />
    );
  }

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      contentContainerStyle={CONTENT_CONTAINER_STYLE}
      refreshControl={
        <RefreshControl
          refreshing={isFetching}
          onRefresh={onRefresh}
          tintColor={Colors.primary}
          colors={REFRESH_COLORS}
        />
      }
      renderSectionHeader={renderSectionHeader}
      renderItem={renderItem}
      ListFooterComponent={ListFooterComponent}
      stickySectionHeadersEnabled={false}
      removeClippedSubviews={true}
      maxToRenderPerBatch={8}
      initialNumToRender={10}
      windowSize={5}
    />
  );
}
