import { useRef, useEffect, useMemo } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTransfer } from '../../hooks/queries';
import { Colors } from '../../theme/colors';
import { SignedImage } from '../ui/SignedImage';
import type { Transfer } from '../../types/transfer';

const SHEET_BG_STYLE = { backgroundColor: '#FFFFFF' };
const SHEET_HANDLE_STYLE = { backgroundColor: '#D4D4D8' };
const CONTENT_CONTAINER_STYLE = { paddingBottom: 32 };

interface Props {
  transferId: string | null;
  isOpen: boolean;
  isApproving: boolean;
  isRejecting: boolean;
  onClose: () => void;
  onApprove: (id: string) => void | Promise<void>;
  onReject: (id: string) => void | Promise<void>;
}

export function TransferAutoApproveSheet({
  transferId,
  isOpen,
  isApproving,
  isRejecting,
  onClose,
  onApprove,
  onReject,
}: Props) {
  const { t } = useTranslation('transfers');
  const sheetRef = useRef<BottomSheet>(null);
  const { top: safeTop } = useSafeAreaInsets();
  const { data: transfer, isLoading: loadingDetail } = useTransfer(transferId, {
    enabled: isOpen && !!transferId,
  });

  useEffect(() => {
    if (isOpen) sheetRef.current?.expand();
    else sheetRef.current?.close();
  }, [isOpen]);

  const lines = useMemo(() => transfer?.lines ?? [], [transfer?.lines]);
  const totalUnits = useMemo(
    () => lines.reduce((acc, l) => acc + Number(l.quantity_sent), 0),
    [lines],
  );
  const totalProducts = lines.length;
  const isBusy = isApproving || isRejecting;

  function handleApprove() {
    if (!transfer) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onApprove(transfer.id);
  }

  function handleReject() {
    if (!transfer) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    onReject(transfer.id);
  }

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={['65%', '95%']}
      topInset={safeTop}
      enablePanDownToClose
      onClose={onClose}
      backgroundStyle={SHEET_BG_STYLE}
      handleIndicatorStyle={SHEET_HANDLE_STYLE}
    >
      <BottomSheetScrollView contentContainerStyle={CONTENT_CONTAINER_STYLE}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pt-3 pb-3">
          <View className="flex-1 pr-3">
            <Text className="text-lg font-bold text-[#11181C]">
              {t('inTransit.autoApproveSheet.title')}
            </Text>
            <Text className="text-xs text-[#71717A] mt-0.5">
              {t('inTransit.autoApproveSheet.subtitle')}
            </Text>
          </View>
          <Pressable
            onPress={onClose}
            className="w-8 h-8 items-center justify-center rounded-full bg-[#F4F4F5] active:opacity-70"
          >
            <X size={16} color="#31374A" />
          </Pressable>
        </View>

        {loadingDetail || !transfer ? (
          <View className="py-20 items-center">
            <ActivityIndicator color={Colors.primary} />
          </View>
        ) : (
          <View className="px-5">
            <BodyContent transfer={transfer} totalProducts={totalProducts} totalUnits={totalUnits} t={t} />

            {/* Footer buttons */}
            <View className="flex-row gap-3 mt-2">
              <Pressable
                onPress={handleReject}
                disabled={isBusy}
                className="flex-1 rounded-2xl py-4 items-center active:opacity-80"
                style={{ backgroundColor: '#FEEBE7', opacity: isBusy ? 0.6 : 1 }}
              >
                {isRejecting ? (
                  <ActivityIndicator color={Colors.danger} />
                ) : (
                  <Text className="font-semibold text-base" style={{ color: Colors.danger }}>
                    {t('inTransit.autoApproveSheet.rejectButton')}
                  </Text>
                )}
              </Pressable>
              <Pressable
                onPress={handleApprove}
                disabled={isBusy}
                className="flex-1 rounded-2xl py-4 items-center active:opacity-80"
                style={{ backgroundColor: Colors.primary, opacity: isBusy ? 0.6 : 1 }}
              >
                {isApproving ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="font-semibold text-white text-base">
                    {t('inTransit.autoApproveSheet.approveButton')}
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        )}
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

interface BodyContentProps {
  transfer: Transfer;
  totalProducts: number;
  totalUnits: number;
  t: ReturnType<typeof useTranslation<'transfers'>>['t'];
}

function BodyContent({ transfer, totalProducts, totalUnits, t }: BodyContentProps) {
  return (
    <>
      {/* Transfer info */}
      <View className="bg-[#F4F4F5] rounded-2xl p-4 mb-4">
        <InfoRow label={t('inTransit.autoApproveSheet.fromStore')} value={transfer.from_store?.name ?? '—'} />
        <InfoRow label={t('inTransit.autoApproveSheet.toStore')} value={transfer.to_store?.name ?? '—'} />
        {transfer.transit_store && (
          <InfoRow label={t('inTransit.autoApproveSheet.transitStore')} value={transfer.transit_store.name} />
        )}
        {transfer.estimated_arrival_at && (
          <InfoRow
            label={t('inTransit.autoApproveSheet.estimatedArrival')}
            value={new Date(transfer.estimated_arrival_at).toLocaleDateString()}
          />
        )}
        {transfer.notes && (
          <View className="mt-2 pt-2 border-t border-[#E4E4E7]">
            <Text className="text-[10px] uppercase tracking-widest text-[#71717A] mb-1">
              {t('inTransit.autoApproveSheet.notes')}
            </Text>
            <Text className="text-xs text-[#11181C] leading-5">{transfer.notes}</Text>
          </View>
        )}
      </View>

      {/* Products */}
      <Text className="text-xs font-semibold uppercase tracking-widest text-[#71717A] mb-3">
        {t('inTransit.autoApproveSheet.productList')}
      </Text>
      <View className="gap-2 mb-4">
        {transfer.lines?.map((line) => {
          const variant = line.article_variant;
          const primaryPhoto =
            variant?.photos?.find((p) => p.is_primary) ?? variant?.photos?.[0];
          const colorHex = variant?.color?.hex_code ?? variant?.color?.hex ?? null;
          return (
            <View
              key={line.id}
              className="flex-row items-center gap-3 rounded-xl bg-[#F4F4F5] p-3"
            >
              <View className="w-12 h-12 rounded-md bg-white border border-[#E4E4E7] overflow-hidden">
                <SignedImage path={primaryPhoto?.url} className="w-full h-full" fallbackIconSize={20} />
              </View>
              <View className="flex-1 min-w-0">
                <Text className="text-sm font-medium text-[#11181C]" numberOfLines={1}>
                  {variant?.article?.name ?? ''}
                </Text>
                <Text className="text-xs font-mono text-[#71717A]" numberOfLines={1}>
                  {variant?.sku ?? ''}
                </Text>
                {variant?.color && (
                  <View className="flex-row items-center gap-1.5 mt-0.5">
                    {colorHex && (
                      <View className="w-3 h-3 rounded-full" style={{ backgroundColor: colorHex }} />
                    )}
                    <Text className="text-xs text-[#71717A]">{variant.color.name}</Text>
                  </View>
                )}
              </View>
              <View className="items-end">
                <Text className="text-[10px] text-[#71717A]">
                  {t('inTransit.autoApproveSheet.units')}
                </Text>
                <Text className="text-sm font-semibold text-[#11181C]">
                  {Number(line.quantity_sent)}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* Summary */}
      <View className="rounded-2xl border px-4 py-3 mb-4" style={{ borderColor: '#ADC8FF', backgroundColor: '#EBF1FF' }}>
        <Text className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: Colors.primary }}>
          {t('inTransit.autoApproveSheet.summary')}
        </Text>
        <View className="flex-row justify-around">
          <View className="items-center">
            <Text className="text-xs text-[#71717A]">
              {t('inTransit.autoApproveSheet.totalProducts', { count: totalProducts })}
            </Text>
            <Text className="text-base font-bold text-[#11181C]">{totalProducts}</Text>
          </View>
          <View className="items-center">
            <Text className="text-xs text-[#71717A]">
              {t('inTransit.autoApproveSheet.totalUnits', { count: totalUnits })}
            </Text>
            <Text className="text-base font-bold text-[#11181C]">{totalUnits}</Text>
          </View>
        </View>
      </View>

      {/* What happens */}
      <Text className="text-xs font-semibold uppercase tracking-widest text-[#71717A] mb-2">
        {t('inTransit.autoApproveSheet.whatHappens')}
      </Text>
      <View className="rounded-2xl px-4 py-3 mb-2" style={{ backgroundColor: '#E8F8E3', borderColor: '#A8E29B', borderWidth: 1 }}>
        <Text className="text-sm font-semibold mb-1" style={{ color: '#1F6D14' }}>
          {t('inTransit.autoApproveSheet.approveTitle')}
        </Text>
        <Text className="text-xs leading-5" style={{ color: '#1F6D14' }}>
          {t('inTransit.autoApproveSheet.approveDescription')}
        </Text>
      </View>
      <View className="rounded-2xl px-4 py-3 mb-5" style={{ backgroundColor: '#FEEBE7', borderColor: '#F9C0B5', borderWidth: 1 }}>
        <Text className="text-sm font-semibold mb-1" style={{ color: '#9A1A02' }}>
          {t('inTransit.autoApproveSheet.rejectTitle')}
        </Text>
        <Text className="text-xs leading-5" style={{ color: '#9A1A02' }}>
          {t('inTransit.autoApproveSheet.rejectDescription', { units: totalUnits })}
        </Text>
      </View>
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between mb-1.5">
      <Text className="text-xs text-[#71717A]">{label}</Text>
      <Text className="text-xs font-medium text-[#11181C]">{value}</Text>
    </View>
  );
}
