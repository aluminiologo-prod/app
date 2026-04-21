import { type ReactNode } from 'react';
import { Text, View, useColorScheme } from 'react-native';
import { Colors } from '../../theme/colors';

interface Props {
  title: string;
  children: ReactNode;
}

/**
 * Labelled card that groups a run of `<ProfileRow>`s. Border + radius are on
 * this wrapper so rows can be flat internally — simplifies divider rendering
 * (rows only need a `borderTop` on the 2nd+ items).
 */
export function ProfileSection({ title, children }: Props) {
  const isDark = useColorScheme() === 'dark';
  const bg = isDark ? '#18191F' : '#FFFFFF';
  const border = isDark ? '#272831' : Colors.brand.creamSoft;
  const titleColor = isDark ? '#9BA1B0' : Colors.brand.navyMuted;

  return (
    <View style={{ marginTop: 22 }}>
      <Text
        style={{
          fontFamily: 'Inter_600SemiBold',
          fontSize: 11,
          letterSpacing: 1,
          textTransform: 'uppercase',
          color: titleColor,
          paddingHorizontal: 20,
          marginBottom: 10,
        }}
      >
        {title}
      </Text>
      <View
        style={{
          marginHorizontal: 16,
          backgroundColor: bg,
          borderRadius: 16,
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
