import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import { Pressable, Text, View, useColorScheme, ActivityIndicator } from 'react-native';
import BottomSheet, { BottomSheetScrollView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { Colors } from '../../theme/colors';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  /** Primary CTA label (e.g. "Save"). Hidden when undefined. */
  primaryLabel?: string;
  onPrimary?: () => void;
  primaryDisabled?: boolean;
  primaryLoading?: boolean;
  /** Optional snap points override; defaults to ['62%','92%']. */
  snapPoints?: (string | number)[];
  children: ReactNode;
}

/**
 * Shared chrome for every profile edit bottom sheet. Owns the BottomSheet
 * instance, the backdrop, the title row with the close button, and the
 * sticky footer with the primary CTA. Children render inside a scroll view
 * so long forms remain usable on small screens.
 */
export function EditSheetFrame({
  isOpen,
  onClose,
  title,
  subtitle,
  primaryLabel,
  onPrimary,
  primaryDisabled,
  primaryLoading,
  snapPoints,
  children,
}: Props) {
  const sheetRef = useRef<BottomSheet>(null);
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === 'dark';

  const points = useMemo(() => snapPoints ?? ['62%', '92%'], [snapPoints]);

  useEffect(() => {
    if (isOpen) sheetRef.current?.expand();
    else sheetRef.current?.close();
  }, [isOpen]);

  const bg = isDark ? '#18191F' : '#FFFFFF';
  const handleColor = isDark ? '#3A3B44' : '#D4D4D8';
  const titleColor = isDark ? '#ECEDEE' : Colors.brand.navy;
  const bodyColor = isDark ? '#9BA1B0' : Colors.brand.navyMuted;
  const borderColor = isDark ? '#272831' : Colors.brand.creamSoft;

  const renderBackdrop = (props: BottomSheetBackdropProps) => (
    <BottomSheetBackdrop
      {...props}
      appearsOnIndex={0}
      disappearsOnIndex={-1}
      pressBehavior="close"
      opacity={0.45}
    />
  );

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={points}
      enablePanDownToClose
      backgroundStyle={{ backgroundColor: bg }}
      handleIndicatorStyle={{ backgroundColor: handleColor }}
      onClose={onClose}
      backdropComponent={renderBackdrop}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingTop: 4,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: borderColor,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontFamily: 'Fraunces_700Bold',
              fontSize: 20,
              color: titleColor,
            }}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 13,
                lineHeight: 18,
                color: bodyColor,
                marginTop: 4,
              }}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
        <Pressable
          onPress={onClose}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Close"
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: isDark ? '#20222A' : Colors.brand.creamSoft,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={18} color={bodyColor} />
        </Pressable>
      </View>

      <BottomSheetScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </BottomSheetScrollView>

      {primaryLabel && onPrimary ? (
        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: Math.max(insets.bottom, 16),
            borderTopWidth: 1,
            borderTopColor: borderColor,
            backgroundColor: bg,
          }}
        >
          <Pressable
            onPress={primaryLoading ? undefined : onPrimary}
            disabled={primaryDisabled || primaryLoading}
            accessibilityRole="button"
            accessibilityLabel={primaryLabel}
            style={({ pressed }) => ({
              height: 52,
              borderRadius: 14,
              backgroundColor: primaryDisabled
                ? isDark
                  ? '#2C2D36'
                  : '#E4E4E7'
                : Colors.brand.orange,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              opacity: pressed ? 0.85 : 1,
              shadowColor: Colors.brand.orange,
              shadowOpacity: primaryDisabled ? 0 : 0.25,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 6 },
              elevation: primaryDisabled ? 0 : 4,
            })}
          >
            {primaryLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text
                style={{
                  fontFamily: 'Inter_700Bold',
                  fontSize: 15,
                  color: primaryDisabled
                    ? isDark
                      ? '#71717A'
                      : Colors.brand.navyMuted
                    : '#FFFFFF',
                  letterSpacing: 0.2,
                }}
              >
                {primaryLabel}
              </Text>
            )}
          </Pressable>
        </View>
      ) : null}
    </BottomSheet>
  );
}
