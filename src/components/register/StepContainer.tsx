import { type ReactNode } from 'react';
import { Platform, StatusBar, View } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInRight } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Colors } from '../../theme/colors';
import { DottedBackground } from './DottedBackground';
import { RegisterHeader } from './RegisterHeader';

interface StepContainerProps {
  /** Step index 1..totalSteps, or undefined to hide the progress bar. */
  step?: number;
  totalSteps?: number;
  variant?: 'light' | 'dark';
  showBack?: boolean;
  showClose?: boolean;
  onBack?: () => void;
  onClose?: () => void;
  /** Content that sits above the pinned footer. */
  children: ReactNode;
  /** CTA + any supporting copy pinned to the bottom (button, legal text…). */
  footer?: ReactNode;
}

/**
 * Common layout + animation wrapper for every step of the register wizard.
 *
 * Responsibilities:
 *   - Pick the background palette (cream for "light" steps, navy for step 2).
 *   - Paint the dotted corner pattern behind everything.
 *   - Render the step header (progress bar + logo + back/close).
 *   - Keyboard-aware scroll so inputs never hide under the software keyboard.
 *   - Pin the footer CTA to the bottom of the viewport, with safe-area padding.
 *   - Animate the body content with a subtle fade+slide on mount — just enough
 *     to make step transitions feel continuous rather than instant.
 */
export function StepContainer({
  step,
  totalSteps,
  variant = 'light',
  showBack,
  showClose,
  onBack,
  onClose,
  children,
  footer,
}: StepContainerProps) {
  const insets = useSafeAreaInsets();
  const bg =
    variant === 'dark' ? Colors.brand.navyDark : Colors.brand.cream;

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      {/* StatusBar is set here via JS — Expo Router does not re-apply per screen. */}
      {Platform.OS === 'android' ? (
        <StatusBar
          backgroundColor={bg}
          barStyle={variant === 'dark' ? 'light-content' : 'dark-content'}
        />
      ) : null}

      <DottedBackground variant={variant} />

      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top + 8,
          paddingHorizontal: 22,
          paddingBottom: insets.bottom + 16,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        enableOnAndroid
        extraScrollHeight={32}
      >
        <RegisterHeader
          step={step}
          totalSteps={totalSteps}
          variant={variant}
          showBack={showBack}
          showClose={showClose}
          onBack={onBack}
          onClose={onClose}
        />

        <Animated.View
          entering={FadeIn.duration(280).delay(60)}
          exiting={FadeOut.duration(160)}
          style={{ flex: 1, paddingTop: 18 }}
        >
          <Animated.View
            entering={SlideInRight.springify().damping(18).mass(0.6).delay(80)}
            style={{ flex: 1 }}
          >
            {children}
          </Animated.View>
        </Animated.View>

        {footer ? (
          <Animated.View
            entering={FadeIn.duration(320).delay(120)}
            style={{ paddingTop: 18 }}
          >
            {footer}
          </Animated.View>
        ) : null}
      </KeyboardAwareScrollView>
    </View>
  );
}
