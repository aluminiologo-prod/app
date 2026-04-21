import { Text, View } from 'react-native';
import { Colors } from '../../theme/colors';

interface SoonBadgeProps {
  label: string;
  variant?: 'light' | 'dark';
}

/**
 * Pill-shaped "MUY PRONTO · 01" badge. Orange dot + uppercase label on an
 * orange-tinted translucent background. Works on cream and navy slides.
 */
export function SoonBadge({ label, variant = 'light' }: SoonBadgeProps) {
  const isDark = variant === 'dark';

  return (
    <View
      style={{
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 999,
        backgroundColor: isDark
          ? 'rgba(229,120,11,0.16)'
          : 'rgba(229,120,11,0.12)',
        borderWidth: 1,
        borderColor: isDark
          ? 'rgba(229,120,11,0.38)'
          : 'rgba(229,120,11,0.32)',
      }}
    >
      <View
        style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: Colors.brand.orange,
        }}
      />
      <Text
        style={{
          fontFamily: 'Inter_700Bold',
          fontSize: 11,
          letterSpacing: 1.6,
          color: Colors.brand.orange,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </Text>
    </View>
  );
}
