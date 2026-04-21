import { useEffect } from 'react';
import { View, Text } from 'react-native';
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
  /** 0–100 completeness percentage. */
  value: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  variant?: 'light' | 'dark';
}

/**
 * SVG ring that animates from 0 → value whenever `value` changes. Drawn
 * counter-clockwise on top of a subtle track so the whole circle is visible
 * even at 0% (nicer first impression than a bare track).
 */
export function CompletenessRing({
  value,
  size = 96,
  strokeWidth = 6,
  label,
  variant = 'light',
}: Props) {
  const clamped = Math.max(0, Math.min(100, value));
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

  const trackColor =
    variant === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(229,120,11,0.15)';
  const textColor = variant === 'dark' ? '#FFFFFF' : Colors.brand.navy;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
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
          position: 'absolute',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            fontFamily: 'Fraunces_700Bold',
            fontSize: 20,
            color: textColor,
          }}
        >
          {`${Math.round(clamped)}%`}
        </Text>
        {label ? (
          <Text
            style={{
              fontFamily: 'Inter_500Medium',
              fontSize: 10,
              color: variant === 'dark' ? '#C7CBD4' : Colors.brand.navyMuted,
              letterSpacing: 0.4,
              textTransform: 'uppercase',
              marginTop: 2,
            }}
          >
            {label}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
