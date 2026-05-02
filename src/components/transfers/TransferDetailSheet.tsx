import { useRef, useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Pressable } from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { X, ChevronDown } from 'lucide-react-native';
import { StatusChip } from '../ui/StatusChip';
import { SignedImage } from '../ui/SignedImage';
import { Colors } from '../../theme/colors';
import { useTransfer } from '../../hooks/queries';
import type { Transfer, TransferLine } from '../../types/transfer';

// Stable style objects — defined once at module scope.
const SHEET_BG_STYLE = { backgroundColor: '#FFFFFF' };
const SHEET_HANDLE_STYLE = { backgroundColor: '#D4D4D8' };
const CONTENT_CONTAINER_STYLE = { paddingBottom: 32 };

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
  const { top: safeTop } = useSafeAreaInsets();
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
      topInset={safeTop}
      enablePanDownToClose
      onClose={onClose}
      backgroundStyle={SHEET_BG_STYLE}
      handleIndicatorStyle={SHEET_HANDLE_STYLE}
    >
      <BottomSheetScrollView contentContainerStyle={CONTENT_CONTAINER_STYLE}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pt-3 pb-4">
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
          <View className="gap-2 mt-1">
            {transfer.lines.map((line) => (
              <ProductLineItem
                key={line.id}
                line={line}
                toStoreId={transfer.to_store_id}
                toStoreName={transfer.to_store?.name ?? ''}
                t={t}
              />
            ))}
          </View>
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

interface ProductLineItemProps {
  line: TransferLine;
  toStoreId: string;
  toStoreName: string;
  t: ReturnType<typeof useTranslation<'transfers'>>['t'];
}

function ProductLineItem({ line, toStoreId, toStoreName, t }: ProductLineItemProps) {
  const [expanded, setExpanded] = useState(false);
  const variant = line.article_variant;
  const primaryPhoto =
    variant?.photos?.find((p) => p.is_primary) ?? variant?.photos?.[0];
  const destinationStock = variant?.stock?.find((s) => s.store_id === toStoreId);
  const qtySent = Number(line.quantity_sent);
  const reorderQty = destinationStock ? Number(destinationStock.reorder_quantity) : 0;
  const shortfall =
    reorderQty > 0 && qtySent < reorderQty ? reorderQty - qtySent : 0;
  const colorHex =
    variant?.color?.hex_code ?? variant?.color?.hex ?? null;

  return (
    <View className="rounded-xl bg-[#F4F4F5] overflow-hidden">
      <Pressable
        onPress={() => setExpanded((v) => !v)}
        className="flex-row items-center gap-3 p-3 active:opacity-70"
      >
        <View className="w-12 h-12 rounded-md bg-white border border-[#E4E4E7] overflow-hidden">
          <SignedImage
            path={primaryPhoto?.url}
            className="w-full h-full"
            fallbackIconSize={20}
          />
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
                <View
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: colorHex }}
                />
              )}
              <Text className="text-xs text-[#71717A]">{variant.color.name}</Text>
            </View>
          )}
        </View>
        <Text className="text-sm font-semibold text-[#11181C]">{qtySent}</Text>
        <View
          style={{ transform: [{ rotate: expanded ? '180deg' : '0deg' }] }}
        >
          <ChevronDown size={16} color="#71717A" />
        </View>
      </Pressable>
      {expanded && (
        <View className="border-t border-[#E4E4E7] bg-white px-3 py-3 gap-2">
          {destinationStock ? (
            <>
              <Text className="text-[10px] uppercase tracking-widest font-semibold text-[#71717A]">
                {t('inTransit.detail.destinationStockConfig', { store: toStoreName })}
              </Text>
              <View className="flex-row flex-wrap">
                <StockField
                  label={t('inTransit.detail.stockQuantity')}
                  value={Number(destinationStock.quantity)}
                />
                <StockField
                  label={t('inTransit.detail.stockReserved')}
                  value={Number(destinationStock.reserved_quantity)}
                />
                <StockField
                  label={t('inTransit.detail.stockMin')}
                  value={Number(destinationStock.min_stock)}
                />
                <StockField
                  label={t('inTransit.detail.stockSafety')}
                  value={Number(destinationStock.safety_stock)}
                />
                <StockField
                  label={t('inTransit.detail.stockMax')}
                  value={Number(destinationStock.max_stock)}
                />
                <StockField
                  label={t('inTransit.detail.stockReorder')}
                  value={reorderQty}
                />
              </View>
              {shortfall > 0 ? (
                <View className="rounded-md bg-[#FFF4E5] border border-[#FBD7A6] px-3 py-2">
                  <Text className="text-xs text-[#9A4D00]">
                    {t('inTransit.detail.shortfallAlert', {
                      sent: qtySent,
                      reorder: reorderQty,
                      missing: shortfall,
                    })}
                  </Text>
                </View>
              ) : reorderQty > 0 ? (
                <View className="rounded-md bg-[#E5F8E0] border border-[#A8E29B] px-3 py-2">
                  <Text className="text-xs text-[#1F6D14]">
                    {t('inTransit.detail.fullReplenishment', { qty: qtySent })}
                  </Text>
                </View>
              ) : null}
            </>
          ) : (
            <Text className="text-xs italic text-[#71717A]">
              {t('inTransit.detail.noDestinationStockConfig')}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

function StockField({ label, value }: { label: string; value: number }) {
  return (
    <View className="w-1/3 mb-2">
      <Text className="text-[10px] text-[#71717A]">{label}</Text>
      <Text className="text-sm font-semibold text-[#11181C]">{value}</Text>
    </View>
  );
}
