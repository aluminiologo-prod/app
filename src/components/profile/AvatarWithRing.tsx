import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '../../theme/colors';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Props {
  /** 1–2 characters, already uppercased by the caller. */
  initials: string;
  /** 0–100 profile completeness. */
  percent: number;
  size?: number;
}

/**
 * Navy avatar circle with initials, wrapped in an animated orange progress
 * ring, with a small orange %-chip tucked into the bottom-right. Matches the
 * onboarding aesthetic (Fraunces serif, brand colors) and is the visual
 * anchor of the profile screen.
 */
export function AvatarWithRing({ initials, percent, size = 128 }: Props) {
  const clamped = Math.max(0, Math.min(100, percent));
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(clamped, {
      duration: 900,
      easing: Easing.out(Easing.cubic),
    });
  }, [clamped, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference - (progress.value / 100) * circumference,
  }));

  // Inset the avatar a few px so the ring doesn't crowd the navy edge.
  const avatarInset = strokeWidth + 4;
  const avatarSize = size - avatarInset * 2;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(229,120,11,0.16)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={Colors.brand.orange}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View
        style={{
          width: avatarSize,
          height: avatarSize,
          borderRadius: avatarSize / 2,
          backgroundColor: Colors.brand.navy,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: Colors.brand.navy,
          shadowOpacity: 0.2,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 8 },
          elevation: 4,
        }}
      >
        <Text
          style={{
            fontFamily: 'Fraunces_700Bold',
            fontSize: avatarSize * 0.38,
            color: '#FFFFFF',
            letterSpacing: 1,
          }}
        >
          {initials}
        </Text>
      </View>

      {/* %-chip anchored at the bottom-right of the avatar circle. Geometry:
          45° down-right from the avatar center lands on the ring. */}
      <View
        style={{
          position: 'absolute',
          bottom: avatarInset - 6,
          right: avatarInset - 10,
          paddingHorizontal: 10,
          paddingVertical: 3,
          borderRadius: 999,
          backgroundColor: Colors.brand.orange,
          borderWidth: 3,
          borderColor: Colors.brand.cream,
          shadowColor: Colors.brand.orange,
          shadowOpacity: 0.35,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          elevation: 3,
        }}
      >
        <Text
          style={{
            fontFamily: 'Inter_700Bold',
            fontSize: 11,
            color: '#FFFFFF',
            letterSpacing: 0.4,
          }}
        >
          {`${Math.round(clamped)}%`}
        </Text>
      </View>
    </View>
  );
}
