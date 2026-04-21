import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../../src/lib/supabase';
import { StepContainer } from '../../../src/components/register/StepContainer';
import { SerifHeading } from '../../../src/components/register/SerifHeading';
import { PrimaryCta } from '../../../src/components/register/PrimaryCta';
import { OtpBoxesInput } from '../../../src/components/register/OtpBoxesInput';
import { useRegister } from '../../../src/contexts/RegisterContext';
import {
  requestRegistrationOtp,
  verifyRegistrationOtp,
} from '../../../src/services/registration.service';
import { useAuth } from '../../../src/contexts/AuthContext';
import { toastApiError } from '../../../src/lib/toast';
import { Colors } from '../../../src/theme/colors';

const COOLDOWN_SECONDS = 30;
const CODE_LENGTH = 6;

export default function RegisterCodeScreen() {
  const { t } = useTranslation('auth');
  const { phone, setVerificationResult } = useRegister();
  const { applyLoginResponse } = useAuth();

  const [code, setCode] = useState('');
  const [cooldown, setCooldown] = useState(COOLDOWN_SECONDS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  useEffect(() => {
    if (error) {
      const t2 = setTimeout(() => setError(false), 1400);
      return () => clearTimeout(t2);
    }
  }, [error]);

  const canVerify = code.length === CODE_LENGTH;

  const handleVerify = async () => {
    if (!canVerify || loading) return;
    try {
      setLoading(true);
      const result = await verifyRegistrationOtp(phone, code);

      if (result.is_existing_user) {
        // Phone already registered — skip rest of wizard, enter the app.
        await applyLoginResponse({
          access_token: result.access_token,
          refresh_token: result.refresh_token,
          account_type: result.account_type!,
          staff: result.staff as never,
          user: result.user as never,
          client: result.client,
        });
        router.replace('/(app)/(tabs)/in-transit');
        return;
      }

      // New user: stash tokens + authUserId for the final `complete` call.
      setVerificationResult({
        authUserId: result.auth_user_id!,
        tokens: {
          access_token: result.access_token,
          refresh_token: result.refresh_token,
        },
      });

      // Prime Supabase's local session so subsequent axios calls carry the Bearer.
      await supabase.auth.setSession({
        access_token: result.access_token,
        refresh_token: result.refresh_token,
      });

      router.push('/(auth)/register/name');
    } catch (err) {
      setError(true);
      setCode('');
      toastApiError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || loading) return;
    try {
      await requestRegistrationOtp(phone);
      setCooldown(COOLDOWN_SECONDS);
    } catch (err) {
      toastApiError(err);
    }
  };

  // Last 4 of the phone shown big in the prompt: e.g. "+58 412 753 9017"
  const prettyPhone = formatPhoneForDisplay(phone);

  const footer = (
    <PrimaryCta
      label={t('register.step2.cta')}
      onPress={handleVerify}
      disabled={!canVerify}
      loading={loading}
    />
  );

  return (
    <StepContainer
      step={2}
      variant="dark"
      onBack={() => router.back()}
      footer={footer}
    >
      <Text
        style={{
          fontFamily: 'Inter_700Bold',
          letterSpacing: 2,
          fontSize: 11,
          color: Colors.brand.orange,
          marginBottom: 10,
        }}
      >
        {'—  ' + t('register.stepIndicator', { current: 2, total: 4 })}
      </Text>

      <SerifHeading
        leading={t('register.step2.titleLeading')}
        italic={t('register.step2.titleItalic')}
        trailing="."
        variant="dark"
      />

      <Text
        style={{
          fontFamily: 'Inter_400Regular',
          fontSize: 15,
          color: 'rgba(255,255,255,0.72)',
          lineHeight: 22,
          marginTop: 14,
        }}
      >
        {t('register.step2.subtitlePrefix', { count: CODE_LENGTH })}{' '}
        <Text style={{ fontFamily: 'Inter_700Bold', color: '#FFFFFF' }}>
          {prettyPhone}
        </Text>
        . {t('register.step2.subtitleSuffix')}
      </Text>

      <View style={{ marginTop: 32 }}>
        <OtpBoxesInput
          value={code}
          onChange={setCode}
          length={CODE_LENGTH}
          variant="dark"
          hasError={error}
        />
      </View>

      <Pressable
        onPress={handleResend}
        disabled={cooldown > 0 || loading}
        accessibilityRole="button"
        accessibilityState={{ disabled: cooldown > 0 || loading }}
        style={{ alignSelf: 'center', marginTop: 24, paddingVertical: 8 }}
        hitSlop={12}
      >
        <Text
          style={{
            fontFamily: 'Inter_500Medium',
            fontSize: 13,
            color:
              cooldown > 0 ? 'rgba(255,255,255,0.55)' : Colors.brand.orange,
          }}
        >
          {cooldown > 0
            ? t('register.step2.didntReceive') +
              '  ·  ' +
              t('register.step2.resendIn', { seconds: cooldown })
            : t('register.step2.resend')}
        </Text>
      </Pressable>
    </StepContainer>
  );
}

function formatPhoneForDisplay(e164: string): string {
  if (!e164) return '';
  // Heuristic: split as +CC NNN NNN NNNN for VE-like 12-char numbers.
  // Keeps the rest untouched.
  const match = e164.match(/^(\+\d{1,3})(\d{3})(\d{3})(\d{4,})$/);
  if (!match) return e164;
  return `${match[1]} ${match[2]} ${match[3]} ${match[4]}`;
}
