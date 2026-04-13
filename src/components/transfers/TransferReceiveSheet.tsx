import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { View, Text, Pressable, TextInput, ActivityIndicator } from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTransfer } from '../../hooks/queries';
import { Colors } from '../../theme/colors';
import type { TransferLine, ReceiveTransferPayload } from '../../types/transfer';

// Stable style objects — defined once at module scope.
const SHEET_BG_STYLE = { backgroundColor: '#FFFFFF' };
const SHEET_HANDLE_STYLE = { backgroundColor: '#D4D4D8' };
const CONTENT_CONTAINER_STYLE = { paddingBottom: 32 };

interface ReceiveLine {
  line_id: string;
  quantity_received: number;
  expanded: boolean;
}

interface TransferReceiveSheetProps {
  transferId: string | null;
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: (payload: ReceiveTransferPayload) => void;
}

export function TransferReceiveSheet({
  transferId,
  isOpen,
  isLoading,
  onClose,
  onConfirm,
}: TransferReceiveSheetProps) {
  const { t } = useTranslation('transfers');
  const sheetRef = useRef<BottomSheet>(null);
  const { data: transfer, isLoading: loadingDetail } = useTransfer(transferId, { enabled: isOpen && !!transferId });

  const [receiveLines, setReceiveLines] = useState<ReceiveLine[]>([]);
  const [incidentNotes, setIncidentNotes] = useState('');

  // Initialize lines when transfer loads
  useEffect(() => {
    if (transfer?.lines) {
      setReceiveLines(
        transfer.lines.map((l) => ({
          line_id: l.id,
          quantity_received: l.quantity_sent,
          expanded: false,
        })),
      );
      setIncidentNotes('');
    }
  }, [transfer?.id, transfer?.lines]);

  useEffect(() => {
    if (isOpen) {
      sheetRef.current?.expand();
    } else {
      sheetRef.current?.close();
    }
  }, [isOpen]);

  // O(1) lookup maps to avoid O(n²) find-in-map patterns.
  const linesById = useMemo<Record<string, TransferLine>>(() => {
    if (!transfer?.lines) return {};
    return Object.fromEntries(transfer.lines.map((l) => [l.id, l]));
  }, [transfer?.lines]);

  // O(1) lookup map: receiveLines state keyed by line_id.
  const receiveLinesById = useMemo<Record<string, ReceiveLine>>(
    () => Object.fromEntries(receiveLines.map((rl) => [rl.line_id, rl])),
    [receiveLines],
  );

  const totalSent = useMemo(
    () => transfer?.lines?.reduce((acc, l) => acc + l.quantity_sent, 0) ?? 0,
    [transfer?.lines],
  );
  const totalReceived = useMemo(
    () => receiveLines.reduce((acc, l) => acc + l.quantity_received, 0),
    [receiveLines],
  );
  const loss = totalSent - totalReceived;
  const hasDiscrepancies = loss > 0;
  const discrepancyCount = useMemo(
    () =>
      receiveLines.filter((rl) => {
        const line = linesById[rl.line_id];
        return line && rl.quantity_received < line.quantity_sent;
      }).length,
    [receiveLines, linesById],
  );

  const updateLine = useCallback((lineId: string, qty: number) => {
    setReceiveLines((prev) =>
      prev.map((l) => l.line_id === lineId ? { ...l, quantity_received: qty } : l),
    );
  }, []);

  const toggleExpand = useCallback((lineId: string) => {
    setReceiveLines((prev) =>
      prev.map((l) => l.line_id === lineId ? { ...l, expanded: !l.expanded } : l),
    );
  }, []);

  const handleConfirm = useCallback(() => {
    // Only send overridden lines
    const overriddenLines = receiveLines.filter((rl) => {
      const line = linesById[rl.line_id];
      return line && rl.quantity_received !== line.quantity_sent;
    });

    const payload: ReceiveTransferPayload = {
      lines: overriddenLines.length > 0 ? overriddenLines : undefined,
      incident_notes: hasDiscrepancies && incidentNotes.trim() ? incidentNotes.trim() : undefined,
    };

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onConfirm(payload);
  }, [receiveLines, linesById, hasDiscrepancies, incidentNotes, onConfirm]);

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={['75%', '95%']}
      enablePanDownToClose
      onClose={onClose}
      backgroundStyle={SHEET_BG_STYLE}
      handleIndicatorStyle={SHEET_HANDLE_STYLE}
    >
      <BottomSheetScrollView contentContainerStyle={CONTENT_CONTAINER_STYLE}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pt-2 pb-3">
          <View>
            <Text className="text-lg font-bold text-[#11181C]">{t('inTransit.receiveModal.title')}</Text>
            <Text className="text-xs text-[#71717A]">{t('inTransit.receiveModal.subtitle')}</Text>
          </View>
          <Pressable onPress={onClose} className="w-8 h-8 items-center justify-center rounded-full bg-[#F4F4F5] active:opacity-70">
            <X size={16} color="#31374A" />
          </Pressable>
        </View>

        {loadingDetail || !transfer ? (
          <View className="py-20 items-center">
            <ActivityIndicator color={Colors.primary} />
          </View>
        ) : (
          <View className="px-5">
            {/* Transfer info */}
            <View className="bg-[#F4F4F5] rounded-2xl p-4 mb-5">
              <InfoRow label={t('inTransit.receiveModal.origin')} value={transfer.from_store?.name} />
              <InfoRow label={t('inTransit.receiveModal.destination')} value={transfer.to_store?.name} />
              {transfer.dispatched_at && (
                <InfoRow
                  label={t('inTransit.receiveModal.dispatched')}
                  value={new Date(transfer.dispatched_at).toLocaleDateString()}
                />
              )}
            </View>

            {/* Product list */}
            <Text className="text-xs font-semibold uppercase tracking-widest text-[#71717A] mb-3">
              {t('inTransit.receiveModal.productList')}
            </Text>

            {transfer.lines?.map((line) => {
              const rl = receiveLinesById[line.id];
              if (!rl) return null;
              const discrepancy = rl.quantity_received - line.quantity_sent;
              const hasDiscrepancy = discrepancy < 0;

              return (
                <View
                  key={line.id}
                  className="rounded-2xl border mb-3 overflow-hidden"
                  style={{
                    borderColor: hasDiscrepancy ? Colors.warning : '#E4E4E7',
                    backgroundColor: hasDiscrepancy ? '#FEF3E2' : '#FFFFFF',
                  }}
                >
                  <Pressable
                    onPress={() => toggleExpand(line.id)}
                    className="flex-row items-center p-3 active:opacity-80"
                  >
                    <View
                      className="w-3 h-3 rounded-full mr-3 flex-shrink-0"
                      style={{ backgroundColor: line.article_variant?.color?.hex ?? '#D4D4D8' }}
                    />
                    <View className="flex-1">
                      <Text className="text-sm font-medium text-[#11181C]" numberOfLines={1}>
                        {line.article_variant?.article?.name}
                      </Text>
                      <Text className="text-xs text-[#71717A]">{line.article_variant?.sku}</Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                      <Text className="text-sm text-[#71717A]">
                        {t('inTransit.receiveModal.sent')}: {line.quantity_sent}
                      </Text>
                      {hasDiscrepancy && (
                        <View className="bg-danger/10 rounded-full px-2 py-0.5">
                          <Text className="text-xs text-danger font-semibold">{discrepancy}</Text>
                        </View>
                      )}
                      {rl.expanded
                        ? <ChevronUp size={16} color="#71717A" />
                        : <ChevronDown size={16} color="#71717A" />
                      }
                    </View>
                  </Pressable>

                  {rl.expanded && (
                    <View className="px-3 pb-3 pt-0 border-t border-[#E4E4E7]">
                      <Text className="text-xs text-[#71717A] mb-2 mt-2">
                        {t('inTransit.receiveModal.quantityReceived')}
                      </Text>
                      <View className="flex-row items-center gap-3">
                        <Pressable
                          onPress={() => updateLine(line.id, Math.max(0, rl.quantity_received - 1))}
                          className="w-9 h-9 rounded-xl bg-[#F4F4F5] items-center justify-center active:opacity-70"
                        >
                          <Text className="text-lg font-bold text-[#31374A]">−</Text>
                        </Pressable>
                        <TextInput
                          className="flex-1 text-center text-base font-semibold text-[#11181C] border border-[#E4E4E7] rounded-xl py-2"
                          keyboardType="numeric"
                          value={String(rl.quantity_received)}
                          onChangeText={(v) => {
                            const n = parseInt(v, 10);
                            if (!isNaN(n)) updateLine(line.id, Math.min(n, line.quantity_sent));
                          }}
                        />
                        <Pressable
                          onPress={() => updateLine(line.id, Math.min(rl.quantity_received + 1, line.quantity_sent))}
                          className="w-9 h-9 rounded-xl bg-[#F4F4F5] items-center justify-center active:opacity-70"
                        >
                          <Text className="text-lg font-bold text-[#31374A]">+</Text>
                        </Pressable>
                      </View>
                      {rl.quantity_received > line.quantity_sent && (
                        <Text className="text-xs text-danger mt-1">
                          {t('inTransit.receiveModal.quantityExceedsSent', { max: line.quantity_sent })}
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              );
            })}

            {/* Summary */}
            <View
              className="rounded-2xl p-4 mb-4"
              style={{ backgroundColor: hasDiscrepancies ? '#FEF3E2' : '#E8F8E3' }}
            >
              <Text className="text-xs font-semibold uppercase tracking-widest mb-3"
                style={{ color: hasDiscrepancies ? Colors.warning : Colors.success }}>
                {t('inTransit.receiveModal.summary')}
              </Text>
              <SummaryRow label={t('inTransit.receiveModal.totalSent')} value={totalSent} />
              <SummaryRow label={t('inTransit.receiveModal.totalReceived')} value={totalReceived} />
              {hasDiscrepancies
                ? <SummaryRow label={t('inTransit.receiveModal.loss')} value={loss} color={Colors.danger} />
                : <Text className="text-xs mt-2" style={{ color: Colors.success }}>
                    {t('inTransit.receiveModal.allMatch')}
                  </Text>
              }
              {hasDiscrepancies && discrepancyCount > 0 && (
                <Text className="text-xs mt-1" style={{ color: Colors.warning }}>
                  {t('inTransit.receiveModal.discrepancies', { count: discrepancyCount })}
                </Text>
              )}
            </View>

            {/* Incident notes (only when discrepancies) */}
            {hasDiscrepancies && (
              <View className="mb-5">
                <Text className="text-xs font-semibold uppercase tracking-widest text-[#71717A] mb-2">
                  {t('inTransit.receiveModal.incidentSection')}
                </Text>
                <TextInput
                  className="border border-[#E4E4E7] rounded-2xl p-3 text-sm text-[#11181C] min-h-[80px]"
                  placeholder={t('inTransit.receiveModal.incidentNotesPlaceholder')}
                  placeholderTextColor="#71717A"
                  multiline
                  textAlignVertical="top"
                  value={incidentNotes}
                  onChangeText={setIncidentNotes}
                />
              </View>
            )}

            {/* Confirm button */}
            <Pressable
              onPress={handleConfirm}
              disabled={isLoading}
              className="rounded-2xl py-4 items-center active:opacity-80"
              style={{ backgroundColor: hasDiscrepancies ? Colors.warning : Colors.success }}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="font-semibold text-white text-base">
                  {hasDiscrepancies
                    ? t('inTransit.receiveModal.confirmReceiveWithIncident')
                    : t('inTransit.receiveModal.confirmReceive')
                  }
                </Text>
              )}
            </Pressable>
          </View>
        )}
      </BottomSheetScrollView>
    </BottomSheet>
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

function SummaryRow({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <View className="flex-row justify-between mb-1">
      <Text className="text-sm text-[#31374A]">{label}</Text>
      <Text className="text-sm font-semibold" style={{ color: color ?? '#11181C' }}>{value}</Text>
    </View>
  );
}
