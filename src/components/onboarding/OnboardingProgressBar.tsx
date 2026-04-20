import { View } from 'react-native';
import Animated, {
  type SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { Colors } from '../../theme/colors';

interface OnboardingProgressBarProps {
  activeIndex: number;
  totalSlides: number;
  /** 0..1 — fill of the currently active segment. */
  progress: SharedValue<number>;
  variant: 'light' | 'dark';
}

/**
 * Reel-style progress bar: N thin segments pinned to the top of the screen.
 * Segments before `activeIndex` are fully filled, segments after are empty, and
 * the active segment fills from 0→1 driven by the shared `progress` value so
 * it tracks the auto-advance timer frame-by-frame.
 */
export function OnboardingProgressBar({
  activeIndex,
  totalSlides,
  progress,
  variant,
}: OnboardingProgressBarProps) {
  const isDark = variant === 'dark';
  const fillColor = isDark ? '#FFFFFF' : Colors.brand.navy;
  const trackColor = isDark ? 'rgba(255,255,255,0.22)' : 'rgba(26,42,74,0.18)';

  return (
    <View style={{ flexDirection: 'row', gap: 6 }}>
      {Array.from({ length: totalSlides }).map((_, idx) => (
        <Segment
          key={idx}
          index={idx}
          activeIndex={activeIndex}
          progress={progress}
          fillColor={fillColor}
          trackColor={trackColor}
        />
      ))}
    </View>
  );
}

function Segment({
  index,
  activeIndex,
  progress,
  fillColor,
  trackColor,
}: {
  index: number;
  activeIndex: number;
  progress: SharedValue<number>;
  fillColor: string;
  trackColor: string;
}) {
  const isPast = index < activeIndex;
  const isActive = index === activeIndex;

  const fillStyle = useAnimatedStyle(() => {
    const scale = isPast ? 1 : isActive ? progress.value : 0;
    return { transform: [{ scaleX: scale }] };
  });

  return (
    <View
      style={{
        flex: 1,
        height: 3,
        borderRadius: 2,
        backgroundColor: trackColor,
        overflow: 'hidden',
      }}
    >
      <Animated.View
        style={[
          {
            height: '100%',
            borderRadius: 2,
            backgroundColor: fillColor,
            transformOrigin: 'left',
          },
          fillStyle,
        ]}
      />
    </View>
  );
}
