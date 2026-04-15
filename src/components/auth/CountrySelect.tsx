import { useState, useEffect, useRef, useMemo } from 'react';
import {
  View, Text, Pressable, Modal, FlatList,
  Animated, Dimensions, TouchableWithoutFeedback, TouchableOpacity,
  useColorScheme, Platform, TextInput,
} from 'react-native';
import { Check, ChevronDown, Search, X } from 'lucide-react-native';
import { useCountries } from '../../hooks/queries';
import { Colors } from '../../theme/colors';
import type { Country } from '../../types/country';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.68;
const ANIM_MS = 280;

export interface CountrySelectProps {
  value: string | null;                         // country_id UUID or null
  onChange: (id: string | null) => void;
  label?: string;
  placeholder?: string;
  isInvalid?: boolean;
  errorMessage?: string;
  isDisabled?: boolean;
  isClearable?: boolean;
}

export function CountrySelect({
  value,
  onChange,
  label,
  placeholder = 'Select country',
  isInvalid = false,
  errorMessage,
  isDisabled = false,
  isClearable = false,
}: CountrySelectProps) {
  const isDark = useColorScheme() === 'dark';
  const { data: countries = [] } = useCountries();

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selected = useMemo(
    () => countries.find((c) => c.id === value) ?? null,
    [countries, value],
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return countries;
    const q = search.toLowerCase();
    return countries.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q),
    );
  }, [countries, search]);

  function handleSelect(c: Country) {
    onChange(c.id);
    setOpen(false);
    setSearch('');
  }

  function handleClear() {
    onChange(null);
  }

  // Bottom sheet animation
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (open) {
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
  }, [open, translateY, backdropOpacity]);

  // Theme tokens
  const borderColor = isInvalid
    ? Colors.danger
    : isDark ? Colors.dark.border : Colors.light.border;
  const surfaceBg  = isDark ? Colors.dark.content1 : '#FFFFFF';
  const textColor  = isDark ? Colors.dark.foreground : Colors.light.foreground;
  const mutedColor = Colors.light.muted;
  const sectionBg  = isDark ? Colors.dark.content2 : '#FAFAFA';
  const sheetBg    = isDark ? Colors.dark.content1 : '#FFFFFF';
  const sheetBorder = isDark ? Colors.dark.border : Colors.light.border;

  return (
    <View>
      {label && (
        <Text style={{
          fontSize: 14, fontWeight: '500',
          color: textColor, marginBottom: 6,
        }}>
          {label}
        </Text>
      )}

      <Pressable
        onPress={() => !isDisabled && setOpen(true)}
        disabled={isDisabled}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          height: 52,
          borderRadius: 16,
          borderWidth: 1,
          borderColor,
          backgroundColor: pressed && !isDisabled
            ? (isDark ? Colors.dark.content2 : Colors.light.content2)
            : surfaceBg,
          paddingHorizontal: 14,
          opacity: isDisabled ? 0.5 : 1,
        })}
      >
        {selected ? (
          <>
            <Text style={{ fontSize: 18, marginRight: 8 }}>{selected.flag_emoji}</Text>
            <Text style={{ flex: 1, fontSize: 16, color: textColor }}>{selected.name}</Text>
          </>
        ) : (
          <Text style={{ flex: 1, fontSize: 16, color: mutedColor }}>{placeholder}</Text>
        )}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          {isClearable && selected && (
            <Pressable
              onPress={(e) => { e.stopPropagation(); handleClear(); }}
              hitSlop={8}
            >
              <X size={14} color={mutedColor} />
            </Pressable>
          )}
          <ChevronDown size={16} color={mutedColor} />
        </View>
      </Pressable>

      {isInvalid && errorMessage && (
        <Text style={{ fontSize: 12, color: Colors.danger, marginTop: 4 }}>
          {errorMessage}
        </Text>
      )}

      <Modal
        visible={open}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={() => setOpen(false)}
      >
        <TouchableWithoutFeedback onPress={() => setOpen(false)} accessible={false}>
          <Animated.View
            style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.48)',
              opacity: backdropOpacity,
            }}
          />
        </TouchableWithoutFeedback>

        <Animated.View
          style={{
            position: 'absolute',
            bottom: 0, left: 0, right: 0,
            height: SHEET_HEIGHT,
            backgroundColor: sheetBg,
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
          <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 4 }}>
            <View style={{
              width: 40, height: 4, borderRadius: 2,
              backgroundColor: isDark ? Colors.dark.content4 : Colors.light.content4,
            }} />
          </View>

          {/* Header */}
          <View style={{
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            paddingHorizontal: 20, paddingTop: 10, paddingBottom: 12,
            borderBottomWidth: 1, borderBottomColor: sheetBorder,
          }}>
            <Text style={{ fontSize: 17, fontWeight: '700', color: textColor }}>
              {label ?? 'Select country'}
            </Text>
            <Pressable
              onPress={() => { setOpen(false); setSearch(''); }}
              style={({ pressed }) => ({
                width: 30, height: 30, borderRadius: 15,
                alignItems: 'center', justifyContent: 'center',
                backgroundColor: pressed ? sheetBorder : (isDark ? Colors.dark.content3 : Colors.light.content2),
              })}
            >
              <X size={14} color={mutedColor} />
            </Pressable>
          </View>

          {/* Search */}
          <View style={{
            flexDirection: 'row', alignItems: 'center',
            marginHorizontal: 20, marginTop: 12, marginBottom: 8,
            paddingHorizontal: 12,
            height: 44, borderRadius: 12,
            borderWidth: 1, borderColor: sheetBorder,
            backgroundColor: sectionBg,
            gap: 8,
          }}>
            <Search size={16} color={mutedColor} />
            <TextInput
              style={{ flex: 1, fontSize: 15, color: textColor }}
              placeholder="Search..."
              placeholderTextColor={mutedColor}
              value={search}
              onChangeText={setSearch}
              autoCorrect={false}
              autoCapitalize="none"
            />
            {search.length > 0 && (
              <Pressable onPress={() => setSearch('')}>
                <X size={14} color={mutedColor} />
              </Pressable>
            )}
          </View>

          {/* Country list */}
          <FlatList
            data={filtered}
            keyExtractor={(c) => c.id}
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: Platform.OS === 'ios' ? 36 : 20 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            renderItem={({ item: c, index }) => {
              const isSelected = c.id === value;
              const isLast = index === filtered.length - 1;
              return (
                <TouchableOpacity
                  onPress={() => handleSelect(c)}
                  activeOpacity={0.7}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    height: 50,
                    borderBottomWidth: isLast ? 0 : 1,
                    borderBottomColor: sheetBorder,
                    backgroundColor: isSelected
                      ? (isDark ? '#0B1833' : Colors.primaryLight)
                      : 'transparent',
                  }}
                >
                  <Text style={{ fontSize: 20, marginRight: 10 }}>{c.flag_emoji}</Text>
                  <Text style={{
                    flex: 1, fontSize: 15,
                    fontWeight: isSelected ? '600' : '400',
                    color: isSelected ? Colors.primary : textColor,
                  }}>
                    {c.name}
                  </Text>
                  {isSelected && (
                    <View style={{
                      width: 22, height: 22, borderRadius: 11,
                      backgroundColor: Colors.primary,
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Check size={12} color="#FFFFFF" strokeWidth={3} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <View style={{ alignItems: 'center', paddingVertical: 32 }}>
                <Text style={{ color: mutedColor, fontSize: 14 }}>No results</Text>
              </View>
            }
          />
        </Animated.View>
      </Modal>
    </View>
  );
}
