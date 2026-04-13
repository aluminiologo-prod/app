import { View, Text, Pressable } from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { StatusChip } from '../ui/StatusChip';
import { Colors } from '../../theme/colors';
import type { Transfer } from '../../types/transfer';

interface TransferCardProps {
  transfer: Transfer;
  canUpdate: boolean;
  onViewDetails: (transfer: Transfer) => void;
  onDispatch: (transfer: Transfer) => void;
  onReceive: (transfer: Transfer) => void;
}

export function TransferCard({
  transfer,
  canUpdate,
  onViewDetails,
  onDispatch,
  onReceive,
}: TransferCardProps) {
  const { t } = useTranslation('transfers');

  const productCount = transfer._count?.lines ?? 0;
  const unitCount = transfer._total_quantity_sent ?? 0;

  const statusLabel = t(`status.${transfer.status}`);

  function handlePress() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onViewDetails(transfer);
  }

  return (
    <Pressable
      onPress={handlePress}
      className="bg-white dark:bg-[#18191F] rounded-2xl border border-[#E4E4E7] dark:border-[#272831] mb-3 overflow-hidden active:opacity-80"
      style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 }}
    >
      <View className="p-4">
        {/* Header: code + status */}
        <View className="flex-row items-center justify-between mb-3">
          <Text className="font-bold text-base text-foreground dark:text-[#ECEDEE] font-mono tracking-wide">
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

        {/* Actions */}
        <View className="flex-row items-center justify-end gap-2">
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onViewDetails(transfer); }}
            className="px-3 py-1.5 rounded-xl border border-[#E4E4E7] dark:border-[#272831] active:opacity-70"
          >
            <Text className="text-xs font-medium text-[#31374A] dark:text-[#9BA1B0]">
              {t('inTransit.viewDetails')}
            </Text>
          </Pressable>

          {canUpdate && transfer.status === 'DRAFT' && (
            <Pressable
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onDispatch(transfer); }}
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
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onReceive(transfer); }}
              className="px-3 py-1.5 rounded-xl active:opacity-70"
              style={{ backgroundColor: Colors.success }}
            >
              <Text className="text-xs font-semibold text-white">
                {t('inTransit.receive')}
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </Pressable>
  );
}
