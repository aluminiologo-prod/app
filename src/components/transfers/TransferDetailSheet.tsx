import { useRef, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import BottomSheet, { BottomSheetView, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react-native';
import { StatusChip } from '../ui/StatusChip';
import { Colors } from '../../theme/colors';
import { useTransfer } from '../../hooks/queries';
import type { Transfer } from '../../types/transfer';

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

interface Row {
  label: string;
  value: string;
}

function InfoRow({ label, value }: Row) {
  return (
    <View className="flex-row justify-between items-start py-2.5 border-b border-[#E4E4E7] dark:border-[#272831]">
      <Text className="text-sm text-[#71717A] flex-1">{label}</Text>
      <Text className="text-sm font-medium text-[#11181C] dark:text-[#ECEDEE] flex-1 text-right">{value}</Text>
    </View>
  );
}

interface TransferDetailSheetProps {
  transferId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TransferDetailSheet({ transferId, isOpen, onClose }: TransferDetailSheetProps) {
  const { t } = useTranslation('transfers');
  const sheetRef = useRef<BottomSheet>(null);
  const { data: transfer, isLoading } = useTransfer(transferId, { enabled: isOpen && !!transferId });

  useEffect(() => {
    if (isOpen) {
      sheetRef.current?.expand();
    } else {
      sheetRef.current?.close();
    }
  }, [isOpen]);

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={['55%', '90%']}
      enablePanDownToClose
      onClose={onClose}
      backgroundStyle={{ backgroundColor: '#FFFFFF' }}
      handleIndicatorStyle={{ backgroundColor: '#D4D4D8' }}
    >
      <BottomSheetScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pt-2 pb-4">
          <Text className="text-lg font-bold text-[#11181C]">
            {t('inTransit.detail.title')}
          </Text>
          <Pressable onPress={onClose} className="w-8 h-8 items-center justify-center rounded-full bg-[#F4F4F5] active:opacity-70">
            <X size={16} color="#31374A" />
          </Pressable>
        </View>

        {isLoading || !transfer ? (
          <View className="py-20 items-center">
            <ActivityIndicator color={Colors.primary} />
          </View>
        ) : (
          <TransferDetailContent transfer={transfer} t={t} />
        )}
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

function TransferDetailContent({ transfer, t }: { transfer: Transfer; t: ReturnType<typeof useTranslation<'transfers'>>['t'] }) {
  return (
    <View className="px-5">
      {/* General Info */}
      <SectionTitle label={t('inTransit.detail.generalInfo')} />
      <View className="mb-1">
        <View className="flex-row justify-between items-center py-2.5 border-b border-[#E4E4E7]">
          <Text className="text-sm text-[#71717A]">{t('inTransit.detail.code')}</Text>
          <Text className="font-mono font-bold text-sm text-[#11181C]">{transfer.code}</Text>
        </View>
        <View className="flex-row justify-between items-center py-2.5 border-b border-[#E4E4E7]">
          <Text className="text-sm text-[#71717A]">{t('inTransit.detail.status')}</Text>
          <StatusChip status={transfer.status} label={transfer.status.replace('_', ' ')} size="sm" />
        </View>
        <InfoRow label={t('inTransit.detail.fromStore')} value={transfer.from_store?.name ?? '—'} />
        <InfoRow label={t('inTransit.detail.toStore')} value={transfer.to_store?.name ?? '—'} />
        {transfer.transit_store && (
          <InfoRow label={t('inTransit.detail.transitStore')} value={transfer.transit_store.name} />
        )}
        <InfoRow label={t('inTransit.detail.estimatedArrival')} value={formatDate(transfer.estimated_arrival_at)} />
        {transfer.notes && (
          <InfoRow label={t('inTransit.detail.notes')} value={transfer.notes} />
        )}
      </View>

      {/* Products */}
      {transfer.lines && transfer.lines.length > 0 && (
        <>
          <SectionTitle label={t('inTransit.detail.productList')} />
          {transfer.lines.map((line) => (
            <View key={line.id} className="flex-row items-center py-2.5 border-b border-[#E4E4E7] gap-3">
              {/* Color dot */}
              <View
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: line.article_variant?.color?.hex ?? '#D4D4D8' }}
              />
              <View className="flex-1">
                <Text className="text-sm font-medium text-[#11181C]" numberOfLines={1}>
                  {line.article_variant?.article?.name}
                </Text>
                <Text className="text-xs text-[#71717A]">{line.article_variant?.sku}</Text>
              </View>
              <Text className="text-sm font-semibold text-[#11181C]">
                {line.quantity_sent}
              </Text>
            </View>
          ))}
        </>
      )}

      {/* Timestamps */}
      <SectionTitle label={t('inTransit.detail.timestamps')} />
      <InfoRow label={t('inTransit.detail.createdAt')} value={formatDate(transfer.created_at)} />
      <InfoRow label={t('inTransit.detail.updatedAt')} value={formatDate(transfer.updated_at)} />
      {transfer.dispatched_at && (
        <InfoRow label={t('inTransit.detail.dispatchedAt')} value={formatDate(transfer.dispatched_at)} />
      )}
      {transfer.received_at && (
        <InfoRow label={t('inTransit.detail.receivedAt')} value={formatDate(transfer.received_at)} />
      )}
    </View>
  );
}

function SectionTitle({ label }: { label: string }) {
  return (
    <Text className="text-xs font-semibold uppercase tracking-widest text-[#71717A] mt-5 mb-1">
      {label}
    </Text>
  );
}
