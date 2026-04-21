import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Info } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { StepContainer } from '../../../src/components/register/StepContainer';
import { SerifHeading } from '../../../src/components/register/SerifHeading';
import { PrimaryCta } from '../../../src/components/register/PrimaryCta';
import { PhoneInput } from '../../../src/components/auth/PhoneInput';
import { isValidPhone } from '../../../src/lib/phone';
import { useRegister } from '../../../src/contexts/RegisterContext';
import { requestRegistrationOtp } from '../../../src/services/registration.service';
import { toastApiError } from '../../../src/lib/toast';
import { Colors } from '../../../src/theme/colors';

export default function RegisterPhoneScreen() {
  const { t } = useTranslation('auth');
  const { phone, setPhone } = useRegister();
  const [loading, setLoading] = useState(false);

  const canSend = isValidPhone(phone);

  const handleContinue = async () => {
    if (!canSend || loading) return;
    try {
      setLoading(true);
      await requestRegistrationOtp(phone);
      router.push('/(auth)/register/code');
    } catch (err) {
      toastApiError(err);
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <View>
      <PrimaryCta
        label={t('register.step1.cta')}
        onPress={handleContinue}
        disabled={!canSend}
        loading={loading}
      />
      <Text
        style={{
          fontFamily: 'Inter_400Regular',
          fontSize: 11,
          color: Colors.brand.navyMuted,
          textAlign: 'center',
          marginTop: 12,
        }}
      >
        {t('register.step1.legalPrefix')}{' '}
        <Text
          style={{
            fontFamily: 'Inter_600SemiBold',
            textDecorationLine: 'underline',
            color: Colors.brand.navy,
          }}
        >
          {t('register.step1.legalTerms')}
        </Text>{' '}
        {t('register.step1.legalAnd')}{' '}
        <Text
          style={{
            fontFamily: 'Inter_600SemiBold',
            textDecorationLine: 'underline',
            color: Colors.brand.navy,
          }}
        >
          {t('register.step1.legalPrivacy')}
        </Text>
        .
      </Text>
      <Pressable
        onPress={() => router.replace('/(auth)/login-otp')}
        accessibilityRole="button"
        style={{ alignSelf: 'center', marginTop: 16, paddingVertical: 6 }}
        hitSlop={10}
      >
        <Text
          style={{
            fontFamily: 'Inter_500Medium',
            fontSize: 13,
            color: Colors.brand.navyMuted,
          }}
        >
          {t('register.step1.haveAccount')}{' '}
          <Text style={{ color: Colors.brand.orange, fontFamily: 'Inter_600SemiBold' }}>
            {t('register.step1.signIn')}
          </Text>
        </Text>
      </Pressable>
    </View>
  );

  return (
    <StepContainer step={1} variant="light" footer={footer}>
      <Text
        style={{
          fontFamily: 'Inter_700Bold',
          letterSpacing: 2,
          fontSize: 11,
          color: Colors.brand.orange,
          marginBottom: 10,
        }}
      >
        {'—  ' + t('register.stepIndicator', { current: 1, total: 4 })}
      </Text>

      <SerifHeading
        leading={t('register.step1.titleLeading')}
        italic={t('register.step1.titleItalic')}
        trailing="?"
        variant="light"
      />

      <Text
        style={{
          fontFamily: 'Inter_400Regular',
          fontSize: 15,
          color: Colors.brand.navyMuted,
          lineHeight: 22,
          marginTop: 14,
        }}
      >
        {t('register.step1.subtitle')}
      </Text>

      <View style={{ marginTop: 32 }}>
        <Text
          style={{
            fontFamily: 'Inter_600SemiBold',
            fontSize: 11,
            letterSpacing: 1.6,
            color: Colors.brand.navyMuted,
            marginBottom: 10,
          }}
        >
          {t('register.step1.label')}
        </Text>
        <PhoneInput
          value={phone}
          onChange={setPhone}
          placeholder={t('register.step1.placeholder')}
          isDisabled={loading}
        />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 }}>
          {canSend ? (
            <Animated.View
              entering={FadeIn.duration(200)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
            >
              <CheckCircle2 size={14} color={Colors.success} strokeWidth={2.2} />
              <Text
                style={{
                  fontFamily: 'Inter_500Medium',
                  fontSize: 13,
                  color: Colors.success,
                }}
              >
                {t('register.step1.valid')}
              </Text>
            </Animated.View>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Info size={14} color={Colors.brand.navyMuted} strokeWidth={2} />
              <Text
                style={{
                  fontFamily: 'Inter_400Regular',
                  fontSize: 13,
                  color: Colors.brand.navyMuted,
                }}
              >
                {t('register.step1.example')}
              </Text>
            </View>
          )}
        </View>
      </View>
    </StepContainer>
  );
}
