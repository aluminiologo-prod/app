import { Text, View } from 'react-native';
import { Colors } from '../../theme/colors';

interface EyebrowProps {
  label: string;
  variant?: 'light' | 'dark';
}

/**
 * Small uppercase label with a leading orange dash. Used as the "BIENVENIDO" /
 * "PRÓXIMAMENTE" tag above / below a section heading.
 */
export function Eyebrow({ label }: EyebrowProps) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <View
        style={{
          width: 18,
          height: 2,
          borderRadius: 1,
          backgroundColor: Colors.brand.orange,
        }}
      />
      <Text
        style={{
          fontFamily: 'Inter_700Bold',
          fontSize: 11,
          letterSpacing: 2.4,
          color: Colors.brand.orange,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </Text>
    </View>
  );
}

/**
 * Same visual style but neutral ink — used as the "PRÓXIMAMENTE" footer under
 * the "coming soon" slides.
 */
export function SoonEyebrow({ label, variant = 'light' }: EyebrowProps) {
  const dashColor =
    variant === 'dark' ? 'rgba(255,255,255,0.42)' : Colors.brand.navyMuted;
  const textColor =
    variant === 'dark' ? 'rgba(255,255,255,0.58)' : Colors.brand.navyMuted;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <View
        style={{
          width: 18,
          height: 2,
          borderRadius: 1,
          backgroundColor: dashColor,
        }}
      />
      <Text
        style={{
          fontFamily: 'Inter_600SemiBold',
          fontSize: 11,
          letterSpacing: 2.4,
          color: textColor,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </Text>
    </View>
  );
}
