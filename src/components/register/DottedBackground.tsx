import Svg, { Circle, Defs, Pattern, Rect } from 'react-native-svg';
import { View } from 'react-native';
import { Colors } from '../../theme/colors';

interface DottedBackgroundProps {
  variant?: 'light' | 'dark';
}

/**
 * Subtle dotted pattern rendered as an absolutely-positioned corner accent.
 * Two patches: top-right and bottom-left, so the pattern never interferes
 * with the form content sitting in the middle of the screen.
 */
export function DottedBackground({ variant = 'light' }: DottedBackgroundProps) {
  const dot = variant === 'dark' ? Colors.brand.dotDark : Colors.brand.dotLight;

  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <Svg
        width="220"
        height="220"
        style={{ position: 'absolute', top: -30, right: -30, opacity: 0.85 }}
        viewBox="0 0 100 100"
      >
        <Defs>
          <Pattern id="dots-tr" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
            <Circle cx="1" cy="1" r="0.9" fill={dot} />
          </Pattern>
        </Defs>
        <Rect x="0" y="0" width="100" height="100" fill="url(#dots-tr)" />
      </Svg>
      <Svg
        width="180"
        height="180"
        style={{ position: 'absolute', bottom: -20, left: -20, opacity: 0.7 }}
        viewBox="0 0 100 100"
      >
        <Defs>
          <Pattern id="dots-bl" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
            <Circle cx="1" cy="1" r="0.9" fill={dot} />
          </Pattern>
        </Defs>
        <Rect x="0" y="0" width="100" height="100" fill="url(#dots-bl)" />
      </Svg>
    </View>
  );
}
