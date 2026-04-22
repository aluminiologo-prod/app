import { Image, Pressable, Text, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  Building2,
  UserCircle2,
  ArrowRight,
  Check,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../src/contexts/AuthContext';
import { Colors } from '../src/theme/colors';
import { DottedBackground } from '../src/components/register/DottedBackground';

type FlowKey = 'client' | 'admin';

export default function FlowChoiceScreen() {
  const { t } = useTranslation('profile');
  const { chooseFlow } = useAuth();
  const isDark = useColorScheme() === 'dark';

  const bg = isDark ? '#0F1117' : Colors.brand.cream;
  const titleColor = isDark ? '#ECEDEE' : Colors.brand.navy;
  const bodyColor = isDark ? '#9BA1B0' : Colors.brand.navyMuted;

  const handlePress = (flow: FlowKey) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    chooseFlow(flow);
  };

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <DottedBackground variant={isDark ? 'dark' : 'light'} />
      <SafeAreaView style={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
            paddingHorizontal: 20,
            paddingVertical: 24,
            justifyContent: 'center',
          }}
        >
          <Image
            source={require('../assets/logo-light.png')}
            resizeMode="contain"
            style={{ width: 140, height: 30, alignSelf: 'center', marginBottom: 24 }}
            accessibilityIgnoresInvertColors
          />

          <Animated.Text
            entering={FadeInDown.duration(380)}
            style={{
              fontFamily: 'Fraunces_700Bold',
              fontSize: 26,
              lineHeight: 32,
              color: titleColor,
              textAlign: 'center',
              marginBottom: 8,
            }}
          >
            {t('flowChoice.title')}
          </Animated.Text>
          <Animated.Text
            entering={FadeInDown.duration(380).delay(100)}
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 14,
              lineHeight: 20,
              color: bodyColor,
              textAlign: 'center',
              marginBottom: 28,
              paddingHorizontal: 12,
            }}
          >
            {t('flowChoice.subtitle')}
          </Animated.Text>

          <FlowCard
            flow="client"
            accent="orange"
            icon={<UserCircle2 size={26} color={Colors.brand.orange} strokeWidth={2} />}
            title={t('flowChoice.client.title')}
            subtitle={t('flowChoice.client.subtitle')}
            features={[
              t('flowChoice.client.feature1'),
              t('flowChoice.client.feature2'),
              t('flowChoice.client.feature3'),
            ]}
            isDark={isDark}
            delay={200}
            onPress={() => handlePress('client')}
          />

          <View style={{ height: 14 }} />

          <FlowCard
            flow="admin"
            accent="blue"
            icon={<Building2 size={26} color={Colors.primary} strokeWidth={2} />}
            title={t('flowChoice.admin.title')}
            subtitle={t('flowChoice.admin.subtitle')}
            features={[
              t('flowChoice.admin.feature1'),
              t('flowChoice.admin.feature2'),
              t('flowChoice.admin.feature3'),
            ]}
            isDark={isDark}
            delay={280}
            onPress={() => handlePress('admin')}
          />

          <Animated.Text
            entering={FadeInDown.duration(380).delay(380)}
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 12,
              color: bodyColor,
              textAlign: 'center',
              marginTop: 20,
            }}
          >
            {t('flowChoice.remember')}
          </Animated.Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

interface FlowCardProps {
  flow: FlowKey;
  accent: 'orange' | 'blue';
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  features: string[];
  isDark: boolean;
  delay: number;
  onPress: () => void;
}

function FlowCard({
  accent,
  icon,
  title,
  subtitle,
  features,
  isDark,
  delay,
  onPress,
}: FlowCardProps) {
  const cardBg = isDark ? '#18191F' : '#FFFFFF';
  const titleColor = isDark ? '#ECEDEE' : Colors.brand.navy;
  const bodyColor = isDark ? '#9BA1B0' : Colors.brand.navyMuted;
  const accentColor = accent === 'orange' ? Colors.brand.orange : Colors.primary;
  const accentBg = accent === 'orange' ? Colors.brand.orangeSoft : Colors.primaryLight;

  return (
    <Animated.View
      entering={FadeInDown.duration(380).delay(delay)}
      style={{ width: '100%' }}
    >
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityHint={subtitle}
        style={({ pressed }) => ({
          width: '100%',
          padding: 18,
          borderRadius: 18,
          backgroundColor: cardBg,
          borderWidth: 1.5,
          borderColor: accentColor,
          shadowColor: accentColor,
          shadowOpacity: pressed ? 0.08 : 0.14,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 6 },
          elevation: 3,
          opacity: pressed ? 0.94 : 1,
        })}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}
        >
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              backgroundColor: accentBg,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </View>
          <View
            style={{
              width: 34,
              height: 34,
              borderRadius: 17,
              backgroundColor: accentBg,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ArrowRight size={16} color={accentColor} strokeWidth={2.2} />
          </View>
        </View>

        <Text
          style={{
            fontFamily: 'Inter_700Bold',
            fontSize: 18,
            color: titleColor,
            marginBottom: 4,
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 13,
            lineHeight: 19,
            color: bodyColor,
            marginBottom: 12,
          }}
        >
          {subtitle}
        </Text>

        <View style={{ gap: 6 }}>
          {features.map((feature, idx) => (
            <View
              key={idx}
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: 8,
              }}
            >
              <View
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  backgroundColor: accentBg,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 1,
                }}
              >
                <Check size={10} color={accentColor} strokeWidth={3} />
              </View>
              <Text
                style={{
                  flex: 1,
                  fontFamily: 'Inter_500Medium',
                  fontSize: 12.5,
                  lineHeight: 18,
                  color: titleColor,
                }}
              >
                {feature}
              </Text>
            </View>
          ))}
        </View>
      </Pressable>
    </Animated.View>
  );
}
