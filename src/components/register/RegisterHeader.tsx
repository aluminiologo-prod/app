import { useEffect } from 'react';
import { Image, Pressable, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { ArrowLeft, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../theme/colors';

const LOGO_LIGHT = require('../../../assets/logo-light.png');
const LOGO_DARK = require('../../../assets/logo-dark.png');

interface RegisterHeaderProps {
  /** Current step 1..totalSteps. Omit to hide the progress bar (e.g. login screens). */
  step?: number;
  variant?: 'light' | 'dark';
  totalSteps?: number;
  /** Whether to render the back button slot. Defaults to `step && step > 1`. */
  showBack?: boolean;
  /** Whether to render the close button slot. Defaults to `step === totalSteps`. */
  showClose?: boolean;
  onBack?: () => void;
  onClose?: () => void;
}

const TOTAL_DEFAULT = 4;

/**
 * Top-of-screen chrome shared by the register flow and the auxiliary
 * single-screen auth views (login-otp, forgot-password):
 *   1. Optional animated progress bar (rendered when `step` is provided).
 *   2. Back arrow (pill button) on the left — opt-in via `showBack`.
 *   3. Brand logo centered.
 *   4. Close X on the right — opt-in via `showClose`.
 */
export function RegisterHeader({
  step,
  variant = 'light',
  totalSteps = TOTAL_DEFAULT,
  showBack,
  showClose,
  onBack,
  onClose,
}: RegisterHeaderProps) {
  const isDark = variant === 'dark';
  const accent = Colors.brand.orange;
  const inactiveTrack = isDark ? 'rgba(255,255,255,0.18)' : Colors.brand.creamSoft;
  const pillBg = isDark ? 'rgba(255,255,255,0.08)' : '#FFFFFF';
  const iconInk = isDark ? '#FFFFFF' : Colors.brand.navy;

  const hasProgress = typeof step === 'number';
  const backVisible = showBack ?? (hasProgress && (step as number) > 1);
  const closeVisible = showClose ?? (hasProgress && step === totalSteps);

  return (
    <View style={{ paddingTop: 8, paddingBottom: 12 }}>
      {/* Progress bar (only if step is provided) */}
      {hasProgress ? (
        <View style={{ flexDirection: 'row', gap: 6, marginBottom: 16 }}>
          {Array.from({ length: totalSteps }).map((_, idx) => (
            <ProgressSegment
              key={idx}
              index={idx}
              currentStep={step as number}
              accent={accent}
              inactiveColor={inactiveTrack}
            />
          ))}
        </View>
      ) : null}

      {/* Row with back + logo + close */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: 44,
        }}
      >
        {/* Back button slot (always reserves space so logo stays centered) */}
        <View style={{ width: 44, alignItems: 'flex-start' }}>
          {backVisible && onBack ? (
            <Pressable
              onPress={() => {
                Haptics.selectionAsync();
                onBack();
              }}
              accessibilityRole="button"
              accessibilityLabel="Back"
              hitSlop={10}
              style={({ pressed }) => ({
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: pillBg,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: pressed ? 0.65 : 1,
                ...(isDark
                  ? {}
                  : {
                      shadowColor: '#000',
                      shadowOpacity: 0.04,
                      shadowRadius: 6,
                      shadowOffset: { width: 0, height: 2 },
                      elevation: 1,
                    }),
              })}
            >
              <ArrowLeft size={18} color={iconInk} strokeWidth={2.2} />
            </Pressable>
          ) : null}
        </View>

        {/* Centered logo — uses the real asset instead of a custom layout */}
        <Image
          source={isDark ? LOGO_DARK : LOGO_LIGHT}
          resizeMode="contain"
          style={{ width: 160, height: 36 }}
          accessibilityIgnoresInvertColors
        />

        {/* Close button slot */}
        <View style={{ width: 44, alignItems: 'flex-end' }}>
          {closeVisible && onClose ? (
            <Pressable
              onPress={() => {
                Haptics.selectionAsync();
                onClose();
              }}
              accessibilityRole="button"
              accessibilityLabel="Close registration"
              hitSlop={10}
              style={({ pressed }) => ({
                width: 44,
                height: 44,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: pressed ? 0.5 : 0.7,
              })}
            >
              <X size={22} color={iconInk} strokeWidth={2} />
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}

/**
 * One segment of the progress bar. Animates its scaleX from 0 → 1 when the
 * step it represents becomes active, and stays filled for all prior steps.
 */
function ProgressSegment({
  index,
  currentStep,
  accent,
  inactiveColor,
}: {
  index: number;
  currentStep: number;
  accent: string;
  inactiveColor: string;
}) {
  const position = index + 1;
  const isFilled = currentStep >= position;
  const progress = useSharedValue(isFilled ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(isFilled ? 1 : 0, {
      duration: 420,
      easing: Easing.out(Easing.cubic),
    });
  }, [isFilled, progress]);

  const fillStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: progress.value }],
  }));

  return (
    <View
      style={{
        flex: 1,
        height: 4,
        borderRadius: 2,
        backgroundColor: inactiveColor,
        overflow: 'hidden',
      }}
    >
      <Animated.View
        style={[
          {
            height: '100%',
            borderRadius: 2,
            backgroundColor: accent,
            transformOrigin: 'left',
          },
          fillStyle,
        ]}
      />
    </View>
  );
}
