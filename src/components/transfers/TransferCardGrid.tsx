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

  // Group by status in order
  const sections = STATUS_ORDER
    .map((status) => ({
      status,
      title: t(SECTION_KEY_MAP[status]),
      data: items.filter((item) => item.status === status),
    }))
    .filter((s) => s.data.length > 0);

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
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
      refreshControl={
        <RefreshControl
          refreshing={isFetching}
          onRefresh={onRefresh}
          tintColor={Colors.primary}
          colors={[Colors.primary]}
        />
      }
      renderSectionHeader={({ section }) => (
        <View className="flex-row items-center gap-2 pt-5 pb-3">
          <Text className="text-sm font-semibold text-[#31374A] dark:text-[#9BA1B0]">
            {section.title}
          </Text>
          <StatusChip status={section.status} label={String(section.data.length)} size="sm" />
        </View>
      )}
      renderItem={({ item }) => (
        <TransferCard
          transfer={item}
          canUpdate={canUpdate}
          onViewDetails={onViewDetails}
          onDispatch={onDispatch}
          onReceive={onReceive}
        />
      )}
      ListFooterComponent={() => (
        <Text className="text-xs text-[#71717A] text-center mt-2 mb-4">
          {t('inTransit.totalTransfers', { count: total })}
        </Text>
      )}
      stickySectionHeadersEnabled={false}
    />
  );
}
