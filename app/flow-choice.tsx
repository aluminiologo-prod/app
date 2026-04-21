import { Image, Pressable, Text, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Building2, UserCircle2, ChevronRight } from 'lucide-react-native';
import { useAuth } from '../src/contexts/AuthContext';
import { Colors } from '../src/theme/colors';
import { DottedBackground } from '../src/components/register/DottedBackground';

/**
 * Shown once for BOTH-users the first time they land after login, and
 * whenever they tap "Switch to admin/client" in the profile. The choice is
 * persisted in AsyncStorage so subsequent launches skip this modal.
 */
export default function FlowChoiceScreen() {
  const { t } = useTranslation('profile');
  const { chooseFlow } = useAuth();
  const isDark = useColorScheme() === 'dark';

  const bg = isDark ? '#0F1117' : Colors.brand.cream;
  const cardBg = isDark ? '#18191F' : '#FFFFFF';
  const border = isDark ? '#272831' : Colors.brand.creamSoft;
  const titleColor = isDark ? '#ECEDEE' : Colors.brand.navy;
  const bodyColor = isDark ? '#9BA1B0' : Colors.brand.navyMuted;

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <DottedBackground variant={isDark ? 'dark' : 'light'} />
      <SafeAreaView style={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
            paddingHorizontal: 24,
            justifyContent: 'center',
          }}
        >
          <Image
            source={require('../assets/logo-light.png')}
            resizeMode="contain"
            style={{ width: 160, height: 34, alignSelf: 'center', marginBottom: 32 }}
            accessibilityIgnoresInvertColors
          />

          <Animated.Text
            entering={FadeInDown.duration(380)}
            style={{
              fontFamily: 'Fraunces_700Bold',
              fontSize: 28,
              lineHeight: 34,
              color: titleColor,
              textAlign: 'center',
              marginBottom: 10,
            }}
          >
            {t('flowChoice.title')}
          </Animated.Text>
          <Animated.Text
            entering={FadeInDown.duration(380).delay(120)}
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 14,
              lineHeight: 20,
              color: bodyColor,
              textAlign: 'center',
              marginBottom: 36,
            }}
          >
            {t('flowChoice.subtitle')}
          </Animated.Text>

          <Animated.View entering={FadeInDown.duration(380).delay(240)}>
            <Pressable
              onPress={() => chooseFlow('client')}
              accessibilityRole="button"
              accessibilityLabel={t('flowChoice.client.title')}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
                padding: 18,
                borderRadius: 18,
                backgroundColor: cardBg,
                borderWidth: 1.5,
                borderColor: Colors.brand.orange,
                shadowColor: Colors.brand.orange,
                shadowOpacity: pressed ? 0.1 : 0.18,
                shadowRadius: 14,
                shadowOffset: { width: 0, height: 8 },
                elevation: 4,
                opacity: pressed ? 0.92 : 1,
              })}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  backgroundColor: Colors.brand.orangeSoft,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <UserCircle2 size={24} color={Colors.brand.orange} strokeWidth={2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: 'Inter_700Bold',
                    fontSize: 16,
                    color: titleColor,
                    marginBottom: 2,
                  }}
                >
                  {t('flowChoice.client.title')}
                </Text>
                <Text
                  style={{
                    fontFamily: 'Inter_400Regular',
                    fontSize: 13,
                    lineHeight: 18,
                    color: bodyColor,
                  }}
                >
                  {t('flowChoice.client.subtitle')}
                </Text>
              </View>
              <ChevronRight size={20} color={bodyColor} />
            </Pressable>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.duration(380).delay(320)}
            style={{ marginTop: 14 }}
          >
            <Pressable
              onPress={() => chooseFlow('admin')}
              accessibilityRole="button"
              accessibilityLabel={t('flowChoice.admin.title')}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
                padding: 18,
                borderRadius: 18,
                backgroundColor: cardBg,
                borderWidth: 1,
                borderColor: border,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  backgroundColor: Colors.primaryLight,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Building2 size={24} color={Colors.primary} strokeWidth={2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: 'Inter_700Bold',
                    fontSize: 16,
                    color: titleColor,
                    marginBottom: 2,
                  }}
                >
                  {t('flowChoice.admin.title')}
                </Text>
                <Text
                  style={{
                    fontFamily: 'Inter_400Regular',
                    fontSize: 13,
                    lineHeight: 18,
                    color: bodyColor,
                  }}
                >
                  {t('flowChoice.admin.subtitle')}
                </Text>
              </View>
              <ChevronRight size={20} color={bodyColor} />
            </Pressable>
          </Animated.View>

          <Animated.Text
            entering={FadeInDown.duration(380).delay(420)}
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 12,
              color: bodyColor,
              textAlign: 'center',
              marginTop: 24,
            }}
          >
            {t('flowChoice.remember')}
          </Animated.Text>
        </View>
      </SafeAreaView>
    </View>
  );
}
