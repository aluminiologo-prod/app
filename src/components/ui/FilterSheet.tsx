import { useRef, useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useTranslation } from 'react-i18next';
import { Check, X } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import type { Store } from '../../types/store';

interface InTransitFilters {
  search: string;
  from_store_id: string;
  to_store_id: string;
  orderBy: string;
}

interface FilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  filters: InTransitFilters;
  stores: Store[];
  onApply: (filters: Partial<InTransitFilters>) => void;
  onClear: () => void;
}

export function FilterSheet({ isOpen, onClose, filters, stores, onApply, onClear }: FilterSheetProps) {
  const { t } = useTranslation(['transfers', 'common']);
  const sheetRef = useRef<BottomSheet>(null);

  const [localFromStore, setLocalFromStore] = useState(filters.from_store_id);
  const [localToStore, setLocalToStore] = useState(filters.to_store_id);
  const [localOrderBy, setLocalOrderBy] = useState(filters.orderBy);

  useEffect(() => {
    setLocalFromStore(filters.from_store_id);
    setLocalToStore(filters.to_store_id);
    setLocalOrderBy(filters.orderBy);
  }, [filters]);

  useEffect(() => {
    if (isOpen) sheetRef.current?.expand();
    else sheetRef.current?.close();
  }, [isOpen]);

  function handleApply() {
    onApply({
      from_store_id: localFromStore,
      to_store_id: localToStore,
      orderBy: localOrderBy,
    });
    onClose();
  }

  function handleClear() {
    setLocalFromStore('');
    setLocalToStore('');
    setLocalOrderBy('created_at:desc');
    onClear();
    onClose();
  }

  const storeOptions = [{ id: '', name: t('transfers:inTransit.allOrigins') }, ...stores];
  const destOptions = [{ id: '', name: t('transfers:inTransit.allDestinations') }, ...stores];

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={['65%']}
      enablePanDownToClose
      onClose={onClose}
      backgroundStyle={{ backgroundColor: '#FFFFFF' }}
      handleIndicatorStyle={{ backgroundColor: '#D4D4D8' }}
    >
      <BottomSheetView style={{ flex: 1, paddingBottom: 32 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pt-2 pb-4">
          <Text className="text-lg font-bold text-[#11181C]">{t('transfers:inTransit.filters')}</Text>
          <Pressable onPress={onClose} className="w-8 h-8 items-center justify-center rounded-full bg-[#F4F4F5]">
            <X size={16} color="#31374A" />
          </Pressable>
        </View>

        <ScrollView className="px-5" showsVerticalScrollIndicator={false}>
          {/* Origin */}
          <FilterSection label={t('transfers:inTransit.allOrigins')}>
            {storeOptions.map((s) => (
              <PickerRow
                key={s.id}
                label={s.name}
                selected={localFromStore === s.id}
                onSelect={() => setLocalFromStore(s.id)}
              />
            ))}
          </FilterSection>

          {/* Destination */}
          <FilterSection label={t('transfers:inTransit.allDestinations')}>
            {destOptions.map((s) => (
              <PickerRow
                key={s.id}
                label={s.name}
                selected={localToStore === s.id}
                onSelect={() => setLocalToStore(s.id)}
              />
            ))}
          </FilterSection>

          {/* Sort */}
          <FilterSection label="Sort">
            <PickerRow label={t('transfers:inTransit.newest')} selected={localOrderBy === 'created_at:desc'} onSelect={() => setLocalOrderBy('created_at:desc')} />
            <PickerRow label={t('transfers:inTransit.oldest')} selected={localOrderBy === 'created_at:asc'} onSelect={() => setLocalOrderBy('created_at:asc')} />
          </FilterSection>
        </ScrollView>

        {/* Footer buttons */}
        <View className="flex-row gap-3 px-5 pt-3">
          <Pressable onPress={handleClear} className="flex-1 py-3.5 rounded-2xl border border-[#E4E4E7] items-center active:opacity-70">
            <Text className="font-medium text-[#31374A]">{t('common:clear')}</Text>
          </Pressable>
          <Pressable onPress={handleApply} className="flex-1 py-3.5 rounded-2xl items-center active:opacity-80"
            style={{ backgroundColor: Colors.primary }}>
            <Text className="font-semibold text-white">{t('common:apply')}</Text>
          </Pressable>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View className="mb-5">
      <Text className="text-xs font-semibold uppercase tracking-widest text-[#71717A] mb-2">{label}</Text>
      <View className="rounded-2xl border border-[#E4E4E7] overflow-hidden">
        {children}
      </View>
    </View>
  );
}

function PickerRow({ label, selected, onSelect }: { label: string; selected: boolean; onSelect: () => void }) {
  return (
    <Pressable
      onPress={onSelect}
      className="flex-row items-center justify-between px-4 py-3 border-b border-[#F4F4F5] last:border-0 active:bg-[#F4F4F5]"
    >
      <Text className={`text-sm ${selected ? 'font-semibold text-primary' : 'text-[#11181C]'}`}
        style={{ color: selected ? Colors.primary : '#11181C' }}>
        {label}
      </Text>
      {selected && <Check size={16} color={Colors.primary} />}
    </Pressable>
  );
}
