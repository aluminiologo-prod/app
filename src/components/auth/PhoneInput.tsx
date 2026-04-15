import { useState, useEffect, useRef, useMemo } from 'react';
import {
  View, Text, TextInput, Pressable, Modal, FlatList,
  Animated, Dimensions, TouchableWithoutFeedback, TouchableOpacity,
  useColorScheme, Platform, ActivityIndicator,
} from 'react-native';
import { Check, ChevronDown, Search, X } from 'lucide-react-native';
import { useCountries } from '../../hooks/queries';
import { parsePhone, buildPhone } from '../../lib/phone';
import { Colors } from '../../theme/colors';
import type { Country } from '../../types/country';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.68;
const ANIM_MS = 280;

export interface PhoneInputProps {
  value: string;                       // E.164 full string ("+584141234567") or ""
  onChange: (value: string) => void;   // emits E.164 full string or ""
  label?: string;
  placeholder?: string;
  isInvalid?: boolean;
  errorMessage?: string;
  isDisabled?: boolean;
  isRequired?: boolean;
  defaultCountryCode?: string;         // ISO-2, default "VE"
}

export function PhoneInput({
  value,
  onChange,
  label,
  placeholder = '0000000000',
  isInvalid = false,
  errorMessage,
  isDisabled = false,
  isRequired = false,
  defaultCountryCode = 'VE',
}: PhoneInputProps) {
  const isDark = useColorScheme() === 'dark';
  const { data: rawCountries = [], isLoading } = useCountries();
  const countries = rawCountries.filter((c) => c.dial_code !== '+0');

  const [countryCode, setCountryCode] = useState(defaultCountryCode);
  const [localNumber, setLocalNumber] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Track the last value we emitted so we don't re-parse our own updates
  const emittedRef = useRef(value);

  // Initialize from `value` once countries are available
  const initializedRef = useRef(false);
  useEffect(() => {
    if (countries.length === 0) return;
    if (initializedRef.current) return;
    initializedRef.current = true;
    if (value) {
      const { country, number } = parsePhone(value, countries, defaultCountryCode);
      setCountryCode(country?.code ?? defaultCountryCode);
      setLocalNumber(number);
    } else {
      const def = countries.find((c) => c.code === defaultCountryCode);
      if (def) setCountryCode(def.code);
    }
  }, [countries, value, defaultCountryCode]);

  // Sync when parent changes value externally (e.g. form reset)
  useEffect(() => {
    if (value === emittedRef.current) return;
    emittedRef.current = value;
    if (!countries.length) return;
    if (!value) {
      setLocalNumber('');
    } else {
      const { country, number } = parsePhone(value, countries, defaultCountryCode);
      setCountryCode(country?.code ?? defaultCountryCode);
      setLocalNumber(number);
    }
  }, [value, countries, defaultCountryCode]);

  const selectedCountry = useMemo(
    () => countries.find((c) => c.code === countryCode)
      ?? countries.find((c) => c.code === defaultCountryCode)
      ?? null,
    [countries, countryCode, defaultCountryCode],
  );

  const filteredCountries = useMemo(() => {
    if (!search.trim()) return countries;
    const q = search.toLowerCase();
    return countries.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dial_code.includes(q) ||
        c.code.toLowerCase().includes(q),
    );
  }, [countries, search]);

  function emitChange(dialCode: string, number: string) {
    const built = buildPhone(dialCode, number);
    emittedRef.current = built;
    onChange(built);
  }

  function handleCountrySelect(c: Country) {
    setCountryCode(c.code);
    setPickerOpen(false);
    setSearch('');
    emitChange(c.dial_code, localNumber);
  }

  function handleNumberChange(text: string) {
    const digits = text.replace(/\D/g, '').slice(0, 10);
    setLocalNumber(digits);
    if (selectedCountry) {
      emitChange(selectedCountry.dial_code, digits);
    }
  }

  // Bottom sheet animation
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (pickerOpen) {
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
  }, [pickerOpen, translateY, backdropOpacity]);

  // Theme tokens
  const borderColor = isInvalid
    ? Colors.danger
    : isDark ? Colors.dark.border : Colors.light.border;
  const surfaceBg   = isDark ? Colors.dark.content1 : '#FFFFFF';
  const textColor   = isDark ? Colors.dark.foreground : Colors.light.foreground;
  const mutedColor  = Colors.light.muted;
  const sheetBg     = isDark ? Colors.dark.content1 : '#FFFFFF';
  const sectionBg   = isDark ? Colors.dark.content2 : '#FAFAFA';
  const sheetBorder = isDark ? Colors.dark.border : Colors.light.border;

  return (
    <View>
      {label && (
        <Text style={{
          fontSize: 14, fontWeight: '500',
          color: textColor, marginBottom: 6,
        }}>
          {label}
          {isRequired && <Text style={{ color: Colors.danger }}> *</Text>}
        </Text>
      )}

      <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: 8 }}>
        {/* Country prefix picker */}
        <TouchableOpacity
          onPress={() => !isDisabled && setPickerOpen(true)}
          disabled={isDisabled}
          activeOpacity={0.7}
          style={{
            width: 96,
            height: 52,
            borderRadius: 16,
            borderWidth: 1,
            borderColor,
            backgroundColor: surfaceBg,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 10,
            opacity: isDisabled ? 0.5 : 1,
          }}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <>
              <Text style={{ fontSize: 18, marginRight: 4 }}>
                {selectedCountry?.flag_emoji || '🌐'}
              </Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: textColor, marginRight: 2 }}>
                {selectedCountry?.dial_code || '+?'}
              </Text>
              <ChevronDown size={12} color={mutedColor} />
            </>
          )}
        </TouchableOpacity>

        {/* Number input */}
        <View style={{
          flex: 1,
          height: 52,
          borderRadius: 16,
          borderWidth: 1,
          borderColor,
          backgroundColor: surfaceBg,
          paddingHorizontal: 16,
          opacity: isDisabled ? 0.5 : 1,
          justifyContent: 'center',
        }}>
          <TextInput
            style={{ fontSize: 16, color: textColor, height: 52, textAlignVertical: 'center' }}
            placeholder={placeholder}
            placeholderTextColor={mutedColor}
            value={localNumber}
            onChangeText={handleNumberChange}
            keyboardType="phone-pad"
            maxLength={10}
            editable={!isDisabled}
            returnKeyType="done"
          />
        </View>
      </View>

      {isInvalid && errorMessage && (
        <Text style={{ fontSize: 12, color: Colors.danger, marginTop: 4 }}>
          {errorMessage}
        </Text>
      )}

      {/* Country picker bottom sheet */}
      <Modal
        visible={pickerOpen}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={() => setPickerOpen(false)}
      >
        <TouchableWithoutFeedback onPress={() => setPickerOpen(false)} accessible={false}>
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
              Select country
            </Text>
            <Pressable
              onPress={() => { setPickerOpen(false); setSearch(''); }}
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
              placeholder="Search country..."
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
            data={filteredCountries}
            keyExtractor={(c) => c.id}
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: Platform.OS === 'ios' ? 36 : 20 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            renderItem={({ item: c, index }) => {
              const isSelected = c.code === countryCode;
              const isLast = index === filteredCountries.length - 1;
              return (
                <TouchableOpacity
                  onPress={() => handleCountrySelect(c)}
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
                  <Text style={{ fontSize: 14, color: mutedColor, marginRight: isSelected ? 8 : 0 }}>
                    {c.dial_code}
                  </Text>
                  {isSelected && (
                    <View style={{
                      width: 22, height: 22, borderRadius: 11,
                      backgroundColor: Colors.primary,
                      alignItems: 'center', justifyContent: 'center',
                      marginRight: 4,
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
