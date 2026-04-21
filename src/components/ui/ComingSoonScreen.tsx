import { Text, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { LucideIcon } from 'lucide-react-native';
import { Colors } from '../../theme/colors';

interface Props {
  icon: LucideIcon;
  title: string;
  subtitle: string;
}

/**
 * Shared placeholder for tabs we haven't built yet (client Home, Orders).
 * Keeps the look cohesive with the profile screen so the empty tabs don't
 * feel like dead ends — just a friendly "we're cooking this up".
 */
export function ComingSoonScreen({ icon: Icon, title, subtitle }: Props) {
  const isDark = useColorScheme() === 'dark';
  const bg = isDark ? '#0F1117' : Colors.brand.cream;
  const card = isDark ? '#18191F' : '#FFFFFF';
  const border = isDark ? '#272831' : Colors.brand.creamSoft;
  const titleColor = isDark ? '#ECEDEE' : Colors.brand.navy;
  const bodyColor = isDark ? '#9BA1B0' : Colors.brand.navyMuted;

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: bg }}>
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 32,
        }}
      >
        <View
          style={{
            width: 84,
            height: 84,
            borderRadius: 24,
            backgroundColor: Colors.brand.orangeSoft,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
          }}
        >
          <Icon size={36} color={Colors.brand.orange} strokeWidth={2} />
        </View>
        <Text
          style={{
            fontFamily: 'Fraunces_700Bold',
            fontSize: 22,
            color: titleColor,
            marginBottom: 10,
            textAlign: 'center',
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 14,
            lineHeight: 22,
            color: bodyColor,
            textAlign: 'center',
          }}
        >
          {subtitle}
        </Text>
        <View
          style={{
            marginTop: 28,
            paddingHorizontal: 14,
            paddingVertical: 8,
            backgroundColor: card,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: border,
          }}
        >
          <Text
            style={{
              fontFamily: 'Inter_600SemiBold',
              fontSize: 12,
              color: Colors.brand.orange,
              letterSpacing: 0.6,
              textTransform: 'uppercase',
            }}
          >
            Coming soon
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
