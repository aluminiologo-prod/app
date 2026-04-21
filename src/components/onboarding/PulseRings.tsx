import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Unlock } from 'lucide-react-native';
import { Colors } from '../../theme/colors';

interface PulseRingsProps {
  /** Diameter of the central orange badge. Rings are sized relative to this. */
  size?: number;
}

/**
 * Central orange badge with three concentric rings that pulse outward — used
 * on the "Access unlocked" slide. Each ring starts at scale 1 and expands /
 * fades out on a 2.4s loop with a staggered delay so the pulses never
 * overlap perfectly and the animation reads as continuous.
 */
export function PulseRings({ size = 96 }: PulseRingsProps) {
  return (
    <View
      style={{
        width: size * 3.2,
        height: size * 3.2,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
      }}
    >
      <Ring size={size} delay={0} />
      <Ring size={size} delay={800} />
      <Ring size={size} delay={1600} />

      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: Colors.brand.orange,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: Colors.brand.orange,
          shadowOpacity: 0.55,
          shadowRadius: 24,
          shadowOffset: { width: 0, height: 0 },
          elevation: 10,
        }}
      >
        <Unlock
          size={Math.round(size * 0.38)}
          color="#FFFFFF"
          strokeWidth={2.2}
        />
      </View>
    </View>
  );
}

function Ring({ size, delay }: { size: number; delay: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { duration: 2400, easing: Easing.out(Easing.quad) }),
        -1,
        false,
      ),
    );
  }, [progress, delay]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + progress.value * 1.6 }],
    opacity: 0.55 * (1 - progress.value),
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 1.5,
          borderColor: Colors.brand.orange,
        },
        style,
      ]}
    />
  );
}
