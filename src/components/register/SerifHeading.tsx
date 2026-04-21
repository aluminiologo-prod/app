import { Text, View } from 'react-native';
import { Colors } from '../../theme/colors';

interface SerifHeadingProps {
  leading: string;
  italic: string;
  trailing?: string;
  variant?: 'light' | 'dark';
}

/**
 * Large editorial-style heading matching the onboarding screens:
 *   "¿Cuál es tu  teléfono ?"   —   plain bold serif + orange italic + plain.
 *
 * The italic fragment picks up the brand orange; everything else uses the
 * navy ink (light variant) or pure white (dark variant). Lines wrap naturally.
 */
export function SerifHeading({
  leading,
  italic,
  trailing,
  variant = 'light',
}: SerifHeadingProps) {
  const inkColor = variant === 'dark' ? '#FFFFFF' : Colors.brand.navy;

  return (
    <View accessibilityRole="header">
      <Text
        style={{
          fontFamily: 'Fraunces_700Bold',
          fontSize: 34,
          lineHeight: 40,
          color: inkColor,
          letterSpacing: -0.5,
        }}
      >
        {leading}
        {leading.endsWith(' ') ? '' : ' '}
        <Text
          style={{
            fontFamily: 'Fraunces_700Bold_Italic',
            color: Colors.brand.orange,
          }}
        >
          {italic}
        </Text>
        {trailing ? trailing : ''}
      </Text>
    </View>
  );
}
