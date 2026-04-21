import { type ReactNode } from 'react';
import { Text, View, useColorScheme } from 'react-native';
import { Colors } from '../../theme/colors';

interface Props {
  title: string;
  /** e.g. "3/3 completos" on the right edge. Optional. */
  counter?: string;
  /** Use the success color for the counter when the section is fully filled. */
  counterComplete?: boolean;
  children: ReactNode;
}

/**
 * Section label + rounded card containing rows. The section title (uppercase
 * eyebrow) lives OUTSIDE the card (matches the design) and a right-aligned
 * counter reports section-level completeness so users can tell at a glance
 * which sections still need attention.
 */
export function ProfileSection({ title, counter, counterComplete, children }: Props) {
  const isDark = useColorScheme() === 'dark';
  const bg = isDark ? '#18191F' : '#FFFFFF';
  const border = isDark ? '#272831' : Colors.brand.creamSoft;
  const titleColor = isDark ? '#9BA1B0' : Colors.brand.navyMuted;
  const counterColor = counterComplete
    ? Colors.success
    : isDark
      ? '#71717A'
      : Colors.brand.navyMuted;

  return (
    <View style={{ marginTop: 22 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          paddingHorizontal: 24,
          marginBottom: 10,
        }}
      >
        <Text
          style={{
            fontFamily: 'Inter_600SemiBold',
            fontSize: 11,
            letterSpacing: 1.4,
            textTransform: 'uppercase',
            color: titleColor,
          }}
        >
          {title}
        </Text>
        {counter ? (
          <Text
            style={{
              fontFamily: 'Inter_500Medium',
              fontSize: 11,
              color: counterColor,
              letterSpacing: 0.4,
            }}
          >
            {counter}
          </Text>
        ) : null}
      </View>
      <View
        style={{
          marginHorizontal: 16,
          backgroundColor: bg,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: border,
          overflow: 'hidden',
        }}
      >
        {children}
      </View>
    </View>
  );
}
