import React, { useCallback } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { StatusChip } from '../ui/StatusChip';
import { Colors } from '../../theme/colors';
import type { Transfer } from '../../types/transfer';

interface TransferCardProps {
  transfer: Transfer;
  canUpdate: boolean;
  isPending?: boolean;
  onViewDetails: (transfer: Transfer) => void;
  onDispatch: (transfer: Transfer) => void;
  onReceive: (transfer: Transfer) => void;
  onReview?: (transfer: Transfer) => void;
}

export const TransferCard = React.memo(function TransferCard({
  transfer,
  canUpdate,
  isPending = false,
  onViewDetails,
  onDispatch,
  onReceive,
  onReview,
}: TransferCardProps) {
  const { t } = useTranslation('transfers');

  const productCount = transfer._count?.lines ?? 0;
  const unitCount = transfer._total_quantity_sent ?? 0;

  const statusLabel = t(`status.${transfer.status}`);

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onViewDetails(transfer);
  }, [onViewDetails, transfer]);

  const handleViewDetails = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onViewDetails(transfer);
  }, [onViewDetails, transfer]);

  const handleDispatch = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onDispatch(transfer);
  }, [onDispatch, transfer]);

  const handleReceive = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onReceive(transfer);
  }, [onReceive, transfer]);

  const handleReview = useCallback(() => {
    if (!onReview) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onReview(transfer);
  }, [onReview, transfer]);

  return (
    <Pressable
      onPress={handlePress}
      className="bg-white dark:bg-[#18191F] rounded-2xl border border-[#E4E4E7] dark:border-[#272831] mb-3 overflow-hidden active:opacity-80"
      style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 }}
    >
      <View className="p-4">
        {/* Header: code + status */}
        <View className="flex-row items-center justify-between mb-3">
          <Text className="font-bold text-base text-foreground dark:text-[#ECEDEE] tracking-wide">
            {transfer.code}
          </Text>
          <StatusChip status={transfer.status} label={statusLabel} />
        </View>

        {/* Route: origin → destination */}
        <View className="flex-row items-center gap-2 mb-2">
          <Text className="text-sm text-[#31374A] dark:text-[#9BA1B0] flex-1" numberOfLines={1}>
            {transfer.from_store?.name}
          </Text>
          <ArrowRight size={14} color={Colors.secondaryDark} />
          <Text className="text-sm text-[#31374A] dark:text-[#9BA1B0] flex-1 text-right" numberOfLines={1}>
            {transfer.to_store?.name}
          </Text>
        </View>

        {/* Counts */}
        <Text className="text-xs text-[#71717A] mb-4">
          {t('inTransit.products', { count: productCount })} · {t('inTransit.units', { count: unitCount })}
        </Text>

        {/* Actions / Pending indicator */}
        {isPending ? (
          <View className="flex-row items-center justify-end" style={{ gap: 6 }}>
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text className="text-xs text-[#71717A]">{t('inTransit.processing')}</Text>
          </View>
        ) : (
          <View className="flex-row items-center justify-end" style={{ gap: 8 }}>
            <Pressable
              onPress={handleViewDetails}
              className="px-3 py-1.5 rounded-xl border border-[#E4E4E7] dark:border-[#272831] active:opacity-70"
            >
              <Text className="text-xs font-medium text-[#31374A] dark:text-[#9BA1B0]">
                {t('inTransit.viewDetails')}
              </Text>
            </Pressable>

            {canUpdate && transfer.status === 'TO_BE_APPROVED' && onReview && (
              <Pressable
                onPress={handleReview}
                className="px-3 py-1.5 rounded-xl active:opacity-70"
                style={{ backgroundColor: Colors.primary }}
              >
                <Text className="text-xs font-semibold text-white">
                  {t('inTransit.review')}
                </Text>
              </Pressable>
            )}

            {canUpdate && transfer.status === 'DRAFT' && (
              <Pressable
                onPress={handleDispatch}
                className="px-3 py-1.5 rounded-xl active:opacity-70"
                style={{ backgroundColor: Colors.warning }}
              >
                <Text className="text-xs font-semibold text-white">
                  {t('inTransit.dispatch')}
                </Text>
              </Pressable>
            )}

            {canUpdate && transfer.status === 'IN_TRANSIT' && (
              <Pressable
                onPress={handleReceive}
                className="px-3 py-1.5 rounded-xl active:opacity-70"
                style={{ backgroundColor: Colors.success }}
              >
                <Text className="text-xs font-semibold text-white">
                  {t('inTransit.receive')}
                </Text>
              </Pressable>
            )}
          </View>
        )}
      </View>
    </Pressable>
  );
});
