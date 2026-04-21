import { type ComponentType } from 'react';
import { View } from 'react-native';
import { Colors } from '../../theme/colors';

interface FeatureIconCardProps {
  icon: ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  variant?: 'light' | 'dark';
  size?: number;
}

/**
 * Rounded square container holding a lucide icon. Used to illustrate each
 * "coming soon" feature (calculator, bag, star). Surface color adapts to the
 * slide variant; icon keeps the brand orange for emphasis.
 */
export function FeatureIconCard({
  icon: Icon,
  variant = 'light',
  size = 76,
}: FeatureIconCardProps) {
  const isDark = variant === 'dark';
  const surface = isDark ? '#1E2D4D' : Colors.brand.orangeSoft;
  const border = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(229,120,11,0.18)';

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: 20,
        backgroundColor: surface,
        borderWidth: 1,
        borderColor: border,
        alignItems: 'center',
        justifyContent: 'center',
        ...(!isDark
          ? {
              shadowColor: Colors.brand.orange,
              shadowOpacity: 0.1,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 6 },
              elevation: 2,
            }
          : {
              shadowColor: '#000',
              shadowOpacity: 0.25,
              shadowRadius: 14,
              shadowOffset: { width: 0, height: 8 },
              elevation: 3,
            }),
      }}
    >
      <Icon
        size={Math.round(size * 0.42)}
        color={Colors.brand.orange}
        strokeWidth={1.8}
      />
    </View>
  );
}
