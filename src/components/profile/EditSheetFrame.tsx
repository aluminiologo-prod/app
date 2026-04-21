import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import {
  Pressable,
  Text,
  View,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetBackdrop,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { SerifHeading } from '../register/SerifHeading';
import { Colors } from '../../theme/colors';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /** Small orange eyebrow above the heading (e.g. "EDITAR"). */
  eyebrow: string;
  /** The three parts of the serif heading ("¿Cómo te" + italic "llamas" + "?"). */
  titleLeading: string;
  titleItalic: string;
  titleTrailing?: string;
  subtitle?: string;
  /** Primary CTA label (e.g. "Guardar"). Hidden when undefined. */
  primaryLabel?: string;
  onPrimary?: () => void;
  primaryDisabled?: boolean;
  primaryLoading?: boolean;
  /** Secondary / cancel label; falls back to i18n "cancel". */
  cancelLabel?: string;
  /** Optional snap points override; when omitted the sheet auto-sizes to content. */
  snapPoints?: (string | number)[];
  /** When true, renders children inside a ScrollView (for long forms). */
  scrollable?: boolean;
  children: ReactNode;
}

/**
 * Shared chrome for every profile edit sheet. Matches the onboarding design:
 *   - Cream background
 *   - "EDITAR" orange eyebrow + small dash
 *   - Big serif heading with an italic accent (e.g. "¿Cómo te *llamas*?")
 *   - Sub-line in muted navy
 *   - Dual-button footer: outlined "Cancelar" + filled orange primary
 *
 * The sheet auto-sizes to its content by default (via CONTENT_HEIGHT) so
 * short forms don't take up the whole screen.
 */
export function EditSheetFrame({
  isOpen,
  onClose,
  eyebrow,
  titleLeading,
  titleItalic,
  titleTrailing,
  subtitle,
  primaryLabel,
  onPrimary,
  primaryDisabled,
  primaryLoading,
  cancelLabel,
  snapPoints,
  scrollable = false,
  children,
}: Props) {
  const { t: tCommon } = useTranslation('common');
  const sheetRef = useRef<BottomSheet>(null);
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === 'dark';

  // Default: auto-size to content via `enableDynamicSizing`. Callers that
  // embed scroll content (long lists of selectable cards, e.g. ClientType
  // picker) can override with fixed snap points.
  const dynamic = !snapPoints;
  const points = useMemo(() => snapPoints, [snapPoints]);

  useEffect(() => {
    if (isOpen) sheetRef.current?.expand();
    else sheetRef.current?.close();
  }, [isOpen]);

  const bg = isDark ? '#18191F' : Colors.brand.cream;
  const handleColor = isDark ? '#3A3B44' : '#D4CFC0';
  const bodyColor = isDark ? '#9BA1B0' : Colors.brand.navyMuted;
  const cancelBg = isDark ? '#20222A' : '#FFFFFF';
  const cancelBorder = isDark ? '#30313A' : '#E2DAC9';
  const cancelText = isDark ? '#ECEDEE' : Colors.brand.navy;

  const renderBackdrop = (props: BottomSheetBackdropProps) => (
    <BottomSheetBackdrop
      {...props}
      appearsOnIndex={0}
      disappearsOnIndex={-1}
      pressBehavior="close"
      opacity={0.45}
    />
  );

  const Body = scrollable ? BottomSheetScrollView : BottomSheetView;

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={points}
      enableDynamicSizing={dynamic}
      enablePanDownToClose
      backgroundStyle={{ backgroundColor: bg }}
      handleIndicatorStyle={{ backgroundColor: handleColor }}
      onClose={onClose}
      backdropComponent={renderBackdrop}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
    >
      <Body
        contentContainerStyle={
          scrollable
            ? { paddingHorizontal: 24, paddingTop: 18, paddingBottom: 12 }
            : undefined
        }
        style={
          scrollable ? undefined : { paddingHorizontal: 24, paddingTop: 18 }
        }
        keyboardShouldPersistTaps={scrollable ? 'handled' : undefined}
      >
        {/* Eyebrow row: small orange dash + "EDITAR" */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 10,
          }}
        >
          <View
            style={{
              width: 22,
              height: 2,
              borderRadius: 1,
              backgroundColor: Colors.brand.orange,
              marginRight: 8,
            }}
          />
          <Text
            style={{
              fontFamily: 'Inter_700Bold',
              fontSize: 11,
              letterSpacing: 1.4,
              textTransform: 'uppercase',
              color: Colors.brand.orange,
            }}
          >
            {eyebrow}
          </Text>
        </View>

        <SerifHeading
          leading={titleLeading}
          italic={titleItalic}
          trailing={titleTrailing}
          variant={isDark ? 'dark' : 'light'}
        />

        {subtitle ? (
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 13,
              lineHeight: 19,
              color: bodyColor,
              marginTop: 10,
              marginBottom: 22,
            }}
          >
            {subtitle}
          </Text>
        ) : (
          <View style={{ height: 22 }} />
        )}

        {children}

        {/* Footer (inline — auto-sizes with the sheet).
            The button visuals live on inner <View>s: Pressable's
            function-style swallows complex style objects on RN 0.81, so we
            keep the pressable minimal and render the pill on a child. */}
        {primaryLabel && onPrimary ? (
          <View
            style={{
              flexDirection: 'row',
              alignSelf: 'stretch',
              marginTop: 14,
              paddingBottom: Math.max(insets.bottom, 10),
            }}
          >
            {/* Each button lives inside a plain flex <View>: Pressable on
                RN 0.81 + Reanimated 4 drops `flex: N` coming from its
                style callback, so the children didn't stretch. Wrapping
                with a regular View is the reliable way to split the row. */}
            <View style={{ flex: 1, marginRight: 6 }}>
              <Pressable
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel={cancelLabel ?? tCommon('cancel')}
                style={({ pressed }) => (pressed ? { opacity: 0.7 } : null)}
              >
                <View
                  style={{
                    height: 52,
                    borderRadius: 14,
                    borderWidth: 1.5,
                    borderColor: cancelBorder,
                    backgroundColor: cancelBg,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontFamily: 'Inter_700Bold',
                      fontSize: 13,
                      letterSpacing: 1,
                      textTransform: 'uppercase',
                      color: cancelText,
                    }}
                  >
                    {cancelLabel ?? tCommon('cancel')}
                  </Text>
                </View>
              </Pressable>
            </View>
            <View style={{ flex: 1.4, marginLeft: 6 }}>
              <Pressable
                onPress={primaryLoading ? undefined : onPrimary}
                disabled={primaryDisabled || primaryLoading}
                accessibilityRole="button"
                accessibilityLabel={primaryLabel}
                style={({ pressed }) =>
                  pressed && !primaryDisabled ? { opacity: 0.85 } : null
                }
              >
                <View
                  style={{
                    height: 52,
                    borderRadius: 14,
                    backgroundColor: primaryDisabled
                      ? isDark
                        ? '#2C2D36'
                        : '#F1E8D7'
                      : Colors.brand.orange,
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'row',
                    shadowColor: Colors.brand.orange,
                    shadowOpacity: primaryDisabled ? 0 : 0.25,
                    shadowRadius: 12,
                    shadowOffset: { width: 0, height: 6 },
                    elevation: primaryDisabled ? 0 : 4,
                  }}
                >
                  {primaryLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text
                      style={{
                        fontFamily: 'Inter_700Bold',
                        fontSize: 13,
                        letterSpacing: 1,
                        textTransform: 'uppercase',
                        color: primaryDisabled
                          ? isDark
                            ? '#71717A'
                            : '#C6B9A0'
                          : '#FFFFFF',
                      }}
                    >
                      {primaryLabel}
                    </Text>
                  )}
                </View>
              </Pressable>
            </View>
          </View>
        ) : null}
      </Body>
    </BottomSheet>
  );
}
