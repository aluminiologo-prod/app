import { useEffect } from 'react';
import { Image, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Animated, {
  Easing,
  FadeInDown,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { Check, UserCircle2, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Pressable } from 'react-native';
import { SerifHeading } from '../../../src/components/register/SerifHeading';
import { PrimaryCta } from '../../../src/components/register/PrimaryCta';
import { DottedBackground } from '../../../src/components/register/DottedBackground';
import { useRegister } from '../../../src/contexts/RegisterContext';
import { Colors } from '../../../src/theme/colors';

export default function RegisterWelcomeScreen() {
  const { t } = useTranslation('auth');
  const { firstName, reset } = useRegister();
  const insets = useSafeAreaInsets();

  // Concentric rings behind the checkmark: scale 0 → 1 with a stagger + loop a
  // subtle breathing pulse once they land, so the screen never feels "frozen".
  const ringInner = useSharedValue(0);
  const ringOuter = useSharedValue(0);

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    ringInner.value = withDelay(
      200,
      withSequence(
        withSpring(1, { damping: 11, stiffness: 140 }),
        withRepeat(
          withSequence(
            withTiming(1.04, { duration: 1400, easing: Easing.inOut(Easing.quad) }),
            withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.quad) }),
          ),
          -1,
          true,
        ),
      ),
    );
    ringOuter.value = withDelay(
      360,
      withSequence(
        withSpring(1, { damping: 13, stiffness: 110 }),
        withRepeat(
          withSequence(
            withTiming(1.08, { duration: 1800, easing: Easing.inOut(Easing.quad) }),
            withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.quad) }),
          ),
          -1,
          true,
        ),
      ),
    );
  }, [ringInner, ringOuter]);

  const innerRingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringInner.value }],
    opacity: ringInner.value,
  }));
  const outerRingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringOuter.value }],
    opacity: 0.5 * ringOuter.value,
  }));

  const handleExplore = () => {
    reset();
    // TODO: once the public catalog is wired up, point this at the public home.
    router.replace('/(app)/(tabs)/in-transit');
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.brand.cream }}>
      <DottedBackground variant="light" />

      {/* Header: centered logo + soft X to dismiss */}
      <View
        style={{
          paddingTop: insets.top + 12,
          paddingHorizontal: 22,
          paddingBottom: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ width: 44 }} />
        <Image
          source={require('../../../assets/logo-light.png')}
          resizeMode="contain"
          style={{ width: 160, height: 36 }}
          accessibilityIgnoresInvertColors
        />
        <Pressable
          onPress={handleExplore}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Close"
          style={{ width: 44, alignItems: 'flex-end', opacity: 0.7 }}
        >
          <X size={22} color={Colors.brand.navy} strokeWidth={2} />
        </Pressable>
      </View>

      {/* Body */}
      <View style={{ flex: 1, paddingHorizontal: 28, justifyContent: 'center' }}>
        {/* Halo behind the checkmark */}
        <View style={{ alignItems: 'center', marginBottom: 36 }}>
          <Animated.View
            style={[
              {
                position: 'absolute',
                width: 200,
                height: 200,
                borderRadius: 100,
                backgroundColor: Colors.brand.orangeSoft,
              },
              outerRingStyle,
            ]}
          />
          <Animated.View
            style={[
              {
                position: 'absolute',
                width: 140,
                height: 140,
                borderRadius: 70,
                borderWidth: 1.5,
                borderColor: 'rgba(229,120,11,0.28)',
              },
              innerRingStyle,
            ]}
          />
          <Animated.View
            entering={ZoomIn.springify().damping(11).stiffness(140).delay(120)}
            style={{
              width: 84,
              height: 84,
              borderRadius: 42,
              backgroundColor: Colors.brand.orange,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: Colors.brand.orange,
              shadowOpacity: 0.35,
              shadowRadius: 18,
              shadowOffset: { width: 0, height: 8 },
              elevation: 8,
            }}
          >
            <Check size={40} color="#FFFFFF" strokeWidth={3} />
          </Animated.View>
        </View>

        <Animated.View
          entering={FadeInDown.duration(420).delay(380)}
          style={{ alignItems: 'center' }}
        >
          <SerifHeading
            leading={t('register.welcome.greeting') + ','}
            italic={firstName || t('register.welcome.fallbackName')}
            trailing="!"
            variant="light"
          />
        </Animated.View>

        <Animated.Text
          entering={FadeInDown.duration(420).delay(520)}
          style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 15,
            color: Colors.brand.navyMuted,
            textAlign: 'center',
            lineHeight: 22,
            marginTop: 12,
            paddingHorizontal: 8,
          }}
        >
          {t('register.welcome.subtitle')}
        </Animated.Text>

        {/* Helper card: "Completa tu perfil" */}
        <Animated.View
          entering={FadeInDown.duration(420).delay(660)}
          style={{
            marginTop: 32,
            flexDirection: 'row',
            gap: 14,
            padding: 16,
            borderRadius: 16,
            backgroundColor: Colors.brand.orangeSoft,
            alignItems: 'flex-start',
          }}
        >
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: '#FFFFFF',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <UserCircle2 size={20} color={Colors.brand.orange} strokeWidth={2.2} />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: 'Inter_700Bold',
                fontSize: 14,
                color: Colors.brand.navy,
                marginBottom: 4,
              }}
            >
              {t('register.welcome.completeProfileTitle')}
            </Text>
            <Text
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 13,
                color: Colors.brand.navyMuted,
                lineHeight: 18,
              }}
            >
              {t('register.welcome.completeProfileBody')}
            </Text>
          </View>
        </Animated.View>
      </View>

      {/* Footer CTA */}
      <View
        style={{
          paddingHorizontal: 22,
          paddingBottom: insets.bottom + 16,
        }}
      >
        <PrimaryCta
          label={t('register.welcome.cta')}
          onPress={handleExplore}
          icon="arrow"
        />
      </View>
    </View>
  );
}
