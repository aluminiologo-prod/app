import { useState, useEffect, useRef, useMemo } from 'react';
import {
  View, Text, Pressable, ScrollView, Modal,
  Animated, Dimensions, TouchableWithoutFeedback,
  useColorScheme, Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Check, X, SlidersHorizontal } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import type { Store } from '../../types/store';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.68;
const ANIM_MS = 280;

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

export function FilterSheet({
  isOpen, onClose, filters, stores, onApply, onClear,
}: FilterSheetProps) {
  const { t } = useTranslation(['transfers', 'common']);
  const isDark = useColorScheme() === 'dark';

  // Animation values
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  // Local filter state — synced from props when sheet opens
  const [localFrom, setLocalFrom] = useState(filters.from_store_id);
  const [localTo, setLocalTo] = useState(filters.to_store_id);
  const [localOrderBy, setLocalOrderBy] = useState(filters.orderBy);

  useEffect(() => {
    if (isOpen) {
      setLocalFrom(filters.from_store_id);
      setLocalTo(filters.to_store_id);
      setLocalOrderBy(filters.orderBy);
    }
  }, [isOpen, filters.from_store_id, filters.to_store_id, filters.orderBy]);

  // Slide in / slide out
  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          damping: 24,
          stiffness: 200,
          mass: 0.8,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: ANIM_MS,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: SHEET_HEIGHT,
          duration: ANIM_MS,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: ANIM_MS - 40,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isOpen, translateY, backdropOpacity]);

  function handleApply() {
    onApply({ from_store_id: localFrom, to_store_id: localTo, orderBy: localOrderBy });
    onClose();
  }

  function handleClear() {
    setLocalFrom('');
    setLocalTo('');
    setLocalOrderBy('created_at:desc');
    onClear();
    onClose();
  }

  const storeOptions = useMemo(
    () => [{ id: '', name: t('transfers:inTransit.allOrigins') }, ...stores],
    [stores, t],
  );
  const destOptions = useMemo(
    () => [{ id: '', name: t('transfers:inTransit.allDestinations') }, ...stores],
    [stores, t],
  );

  const hasActiveFilters = !!(localFrom || localTo || localOrderBy !== 'created_at:desc');

  // Theme tokens
  const surfaceBg     = isDark ? Colors.dark.content1  : '#FFFFFF';
  const sectionBg     = isDark ? Colors.dark.content2  : '#FAFAFA';
  const borderColor   = isDark ? Colors.dark.border    : Colors.light.border;
  const handleColor   = isDark ? Colors.dark.content4  : Colors.light.content4;
  const textColor     = isDark ? Colors.dark.foreground : Colors.light.foreground;

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* Dim backdrop */}
      <TouchableWithoutFeedback onPress={onClose} accessible={false}>
        <Animated.View
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.48)',
            opacity: backdropOpacity,
          }}
        />
      </TouchableWithoutFeedback>

      {/* Sheet panel */}
      <Animated.View
        style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          height: SHEET_HEIGHT,
          backgroundColor: surfaceBg,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          overflow: 'hidden',
          transform: [{ translateY }],
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -6 },
          shadowOpacity: 0.15,
          shadowRadius: 20,
          elevation: 30,
        }}
      >
        {/* Drag handle */}
        <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 2 }}>
          <View style={{
            width: 40, height: 4, borderRadius: 2,
            backgroundColor: handleColor,
          }} />
        </View>

        {/* Header */}
        <View style={{
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
          paddingHorizontal: 20, paddingTop: 12, paddingBottom: 14,
          borderBottomWidth: 1, borderBottomColor: borderColor,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <SlidersHorizontal size={18} color={Colors.primary} />
            <Text style={{ fontSize: 17, fontWeight: '700', color: textColor }}>
              {t('transfers:inTransit.filters')}
            </Text>
            {hasActiveFilters && (
              <View style={{
                backgroundColor: Colors.primaryLight,
                borderRadius: 99, paddingHorizontal: 8, paddingVertical: 2,
              }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.primary }}>
                  Active
                </Text>
              </View>
            )}
          </View>

          <Pressable
            onPress={onClose}
            style={({ pressed }) => ({
              width: 30, height: 30, borderRadius: 15,
              alignItems: 'center', justifyContent: 'center',
              backgroundColor: pressed ? borderColor : (isDark ? Colors.dark.content3 : Colors.light.content2),
            })}
          >
            <X size={14} color={Colors.light.muted} />
          </Pressable>
        </View>

        {/* Options */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20, paddingBottom: 12 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <FilterSection
            label={t('transfers:inTransit.allOrigins')}
            sectionBg={sectionBg}
            borderColor={borderColor}
          >
            {storeOptions.map((s, i) => (
              <PickerRow
                key={s.id}
                label={s.name}
                selected={localFrom === s.id}
                onSelect={() => setLocalFrom(s.id)}
                isDark={isDark}
                borderColor={borderColor}
                isLast={i === storeOptions.length - 1}
              />
            ))}
          </FilterSection>

          <FilterSection
            label={t('transfers:inTransit.allDestinations')}
            sectionBg={sectionBg}
            borderColor={borderColor}
          >
            {destOptions.map((s, i) => (
              <PickerRow
                key={s.id}
                label={s.name}
                selected={localTo === s.id}
                onSelect={() => setLocalTo(s.id)}
                isDark={isDark}
                borderColor={borderColor}
                isLast={i === destOptions.length - 1}
              />
            ))}
          </FilterSection>

          <FilterSection
            label={t('transfers:inTransit.sortOrder', { defaultValue: 'Sort order' })}
            sectionBg={sectionBg}
            borderColor={borderColor}
          >
            <PickerRow
              label={t('transfers:inTransit.newest')}
              selected={localOrderBy === 'created_at:desc'}
              onSelect={() => setLocalOrderBy('created_at:desc')}
              isDark={isDark}
              borderColor={borderColor}
              isLast={false}
            />
            <PickerRow
              label={t('transfers:inTransit.oldest')}
              selected={localOrderBy === 'created_at:asc'}
              onSelect={() => setLocalOrderBy('created_at:asc')}
              isDark={isDark}
              borderColor={borderColor}
              isLast
            />
          </FilterSection>
        </ScrollView>

        {/* Footer actions */}
        <View style={{
          flexDirection: 'row', gap: 12,
          paddingHorizontal: 20, paddingTop: 12,
          paddingBottom: Platform.OS === 'ios' ? 36 : 20,
          borderTopWidth: 1, borderTopColor: borderColor,
          backgroundColor: surfaceBg,
        }}>
          <Pressable
            onPress={handleClear}
            style={({ pressed }) => ({
              flex: 1, height: 52, borderRadius: 16,
              borderWidth: 1, borderColor,
              alignItems: 'center', justifyContent: 'center',
              backgroundColor: pressed
                ? (isDark ? Colors.dark.content3 : Colors.light.content2)
                : 'transparent',
            })}
          >
            <Text style={{ fontSize: 15, fontWeight: '600', color: textColor }}>
              {t('common:clear')}
            </Text>
          </Pressable>

          <Pressable
            onPress={handleApply}
            style={({ pressed }) => ({
              flex: 1, height: 52, borderRadius: 16,
              alignItems: 'center', justifyContent: 'center',
              backgroundColor: pressed ? '#2960E0' : Colors.primary,
            })}
          >
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#FFFFFF' }}>
              {t('common:apply')}
            </Text>
          </Pressable>
        </View>
      </Animated.View>
    </Modal>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function FilterSection({
  label, children, sectionBg, borderColor,
}: {
  label: string;
  children: React.ReactNode;
  sectionBg: string;
  borderColor: string;
}) {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={{
        fontSize: 11, fontWeight: '700', letterSpacing: 0.8,
        textTransform: 'uppercase', color: Colors.light.muted, marginBottom: 8,
      }}>
        {label}
      </Text>
      <View style={{
        borderRadius: 16, borderWidth: 1, borderColor,
        backgroundColor: sectionBg, overflow: 'hidden',
      }}>
        {children}
      </View>
    </View>
  );
}

function PickerRow({
  label, selected, onSelect, isDark, borderColor, isLast,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
  isDark: boolean;
  borderColor: string;
  isLast: boolean;
}) {
  return (
    <Pressable
      onPress={onSelect}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        height: 50,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: borderColor,
        backgroundColor: pressed
          ? (isDark ? Colors.dark.content3 : Colors.light.content2)
          : selected
            ? (isDark ? '#0B1833' : Colors.primaryLight)
            : 'transparent',
      })}
    >
      <Text style={{
        fontSize: 15,
        fontWeight: selected ? '600' : '400',
        color: selected ? Colors.primary : (isDark ? Colors.dark.foreground : Colors.light.foreground),
        flex: 1,
      }}>
        {label}
      </Text>
      {selected && (
        <View style={{
          width: 22, height: 22, borderRadius: 11,
          backgroundColor: Colors.primary,
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Check size={12} color="#FFFFFF" strokeWidth={3} />
        </View>
      )}
    </Pressable>
  );
}
