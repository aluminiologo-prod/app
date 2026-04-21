import { useEffect, useRef } from 'react';
import { Pressable, TextInput, View, Text } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '../../theme/colors';

interface OtpBoxesInputProps {
  value: string;
  onChange: (next: string) => void;
  length?: number;
  autoFocus?: boolean;
  variant?: 'light' | 'dark';
  hasError?: boolean;
}

const DEFAULT_LENGTH = 6;

/**
 * A PIN-style input that renders N visually-separated boxes but delegates
 * typing to a single hidden TextInput. This gives us the fat, beautiful
 * look without fighting RN's focus/selection quirks that come with using
 * N real inputs.
 *
 * The "active" box (the one about to receive the next digit) is highlighted
 * with the brand orange border and a gentle scale pulse to guide the eye.
 * A blinking cursor line animates inside the active empty box.
 */
export function OtpBoxesInput({
  value,
  onChange,
  length = DEFAULT_LENGTH,
  autoFocus = true,
  variant = 'dark',
  hasError = false,
}: OtpBoxesInputProps) {
  const inputRef = useRef<TextInput>(null);
  const isDark = variant === 'dark';

  useEffect(() => {
    if (autoFocus) {
      const t = setTimeout(() => inputRef.current?.focus(), 200);
      return () => clearTimeout(t);
    }
  }, [autoFocus]);

  const activeIndex = Math.min(value.length, length - 1);

  return (
    <Pressable onPress={() => inputRef.current?.focus()} accessibilityRole="none">
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        {Array.from({ length }).map((_, i) => (
          <OtpBox
            key={i}
            index={i}
            digit={value[i] ?? ''}
            isActive={i === value.length && value.length < length}
            isFilled={i < value.length}
            hasError={hasError}
            variant={isDark ? 'dark' : 'light'}
          />
        ))}
      </View>

      {/* Hidden real input — fully transparent, absolutely covers the boxes
         so taps anywhere on the row focus it. */}
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(v) => onChange(v.replace(/\D/g, '').slice(0, length))}
        keyboardType="number-pad"
        returnKeyType="done"
        maxLength={length}
        autoFocus={autoFocus}
        // iOS only: surfaces the incoming SMS one-tap suggestion bar
        textContentType="oneTimeCode"
        // Android: same concept via autocomplete hint
        autoComplete="sms-otp"
        accessibilityLabel={`One-time code, ${length} digits`}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0,
          color: 'transparent',
        }}
        caretHidden
      />
      {/* Screen-reader announcement for current progress */}
      <Text
        accessibilityLiveRegion="polite"
        style={{ width: 0, height: 0, opacity: 0 }}
      >
        {`${value.length} of ${length} digits entered`}
      </Text>
      {/* Anchor active index so TS doesn't complain about unused var */}
      <View style={{ height: 0, opacity: 0 }}>
        <Text>{activeIndex}</Text>
      </View>
    </Pressable>
  );
}

function OtpBox({
  digit,
  isActive,
  isFilled,
  hasError,
  variant,
}: {
  index: number;
  digit: string;
  isActive: boolean;
  isFilled: boolean;
  hasError: boolean;
  variant: 'light' | 'dark';
}) {
  const isDark = variant === 'dark';

  // "Pop" animation when a digit lands inside this box.
  const scale = useSharedValue(1);
  useEffect(() => {
    if (isFilled) {
      scale.value = withSequence(
        withTiming(1.08, { duration: 120, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: 160, easing: Easing.inOut(Easing.quad) }),
      );
    }
  }, [isFilled, scale]);
  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Blinking cursor inside the currently-active empty box.
  const cursorOpacity = useSharedValue(isActive ? 1 : 0);
  useEffect(() => {
    if (!isActive) {
      cursorOpacity.value = withTiming(0, { duration: 120 });
      return;
    }
    cursorOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 500, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.15, { duration: 500, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      true,
    );
  }, [isActive, cursorOpacity]);
  const cursorStyle = useAnimatedStyle(() => ({ opacity: cursorOpacity.value }));

  const borderColor = hasError
    ? Colors.danger
    : isActive
      ? Colors.brand.orange
      : isDark
        ? 'rgba(255,255,255,0.18)'
        : Colors.brand.creamSoft;

  const bg = isDark
    ? isActive
      ? 'rgba(229,120,11,0.10)'
      : Colors.brand.navySurface
    : isActive
      ? '#FFF8EE'
      : '#FFFFFF';

  const digitColor = isDark ? '#FFFFFF' : Colors.brand.navy;

  return (
    <Animated.View
      style={[
        {
          flex: 1,
          height: 64,
          borderRadius: 14,
          borderWidth: 2,
          borderColor,
          backgroundColor: bg,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: isActive ? Colors.brand.orange : '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isActive ? 0.25 : 0.04,
          shadowRadius: isActive ? 12 : 4,
          elevation: isActive ? 4 : 0,
        },
        scaleStyle,
      ]}
    >
      {digit ? (
        <Text
          style={{
            fontFamily: 'Inter_700Bold',
            fontSize: 26,
            color: digitColor,
          }}
        >
          {digit}
        </Text>
      ) : (
        <Animated.View
          style={[
            {
              width: 2,
              height: 26,
              borderRadius: 1,
              backgroundColor: Colors.brand.orange,
            },
            cursorStyle,
          ]}
        />
      )}
    </Animated.View>
  );
}
