import { useEffect } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { ArrowRight, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../theme/colors';

interface PrimaryCtaProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: 'arrow' | 'check';
}

/**
 * Orange pill CTA button used across the register flow.
 *
 * States:
 *   disabled → flat gray, no glow, no haptic, not pressable
 *   enabled  → brand orange with a soft glow shadow that gently breathes to
 *              draw the eye once the user has filled the input.
 *   loading  → spinner instead of label; disables press.
 *
 * Implementation note: the background color + shadow live on the outer
 * Animated.View (not on the Pressable), because wrapping a Pressable whose
 * `style` is a function inside an Animated.View caused the styles to not
 * render on iOS in some cases. The Pressable itself is transparent and only
 * provides the layout + the pressed feedback.
 */
export function PrimaryCta({
  label,
  onPress,
  disabled = false,
  loading = false,
  icon = 'arrow',
}: PrimaryCtaProps) {
  const isInactive = disabled || loading;

  // Breathing glow when the CTA becomes actionable.
  const glow = useSharedValue(0);
  // Small scale-down on press-in for tactile feedback.
  const pressScale = useSharedValue(1);

  useEffect(() => {
    if (isInactive) {
      glow.value = withTiming(0, { duration: 200 });
      return;
    }
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.4, { duration: 1200, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      true,
    );
  }, [isInactive, glow]);

  const containerStyle = useAnimatedStyle(() => ({
    shadowOpacity: isInactive ? 0 : 0.18 + glow.value * 0.28,
    shadowRadius: isInactive ? 0 : 16 + glow.value * 10,
    transform: [{ scale: pressScale.value }],
  }));

  const handlePressIn = () => {
    if (isInactive) return;
    pressScale.value = withSpring(0.98, { damping: 18, stiffness: 260 });
  };
  const handlePressOut = () => {
    pressScale.value = withSpring(1, { damping: 18, stiffness: 260 });
  };

  const textColor = '#FFFFFF';
  const bg = isInactive ? '#CFC7B6' : Colors.brand.orange;

  return (
    <View style={{ paddingVertical: 8 }}>
      <Animated.View
        style={[
          {
            borderRadius: 999,
            backgroundColor: bg,
            shadowColor: Colors.brand.orange,
            shadowOffset: { width: 0, height: 8 },
            elevation: isInactive ? 0 : 6,
            overflow: 'hidden',
          },
          containerStyle,
        ]}
      >
        <Pressable
          onPress={() => {
            if (isInactive) return;
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onPress();
          }}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={isInactive}
          accessibilityRole="button"
          accessibilityLabel={label}
          accessibilityState={{ disabled: isInactive, busy: loading }}
          android_ripple={
            isInactive ? undefined : { color: 'rgba(255,255,255,0.22)' }
          }
          style={{
            paddingVertical: 18,
            paddingHorizontal: 24,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
          }}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text
                style={{
                  fontFamily: 'Inter_700Bold',
                  color: textColor,
                  fontSize: 15,
                  letterSpacing: 1.4,
                }}
              >
                {label.toUpperCase()}
              </Text>
              {icon === 'arrow' ? (
                <ArrowRight size={18} color={textColor} strokeWidth={2.4} />
              ) : (
                <Check size={18} color={textColor} strokeWidth={2.6} />
              )}
            </>
          )}
        </Pressable>
      </Animated.View>
    </View>
  );
}
