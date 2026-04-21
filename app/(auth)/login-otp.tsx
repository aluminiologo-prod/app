import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Animated, { FadeIn } from 'react-native-reanimated';
import { CheckCircle2, Info } from 'lucide-react-native';
import Constants from 'expo-constants';
import { useAuth } from '../../src/contexts/AuthContext';
import { Colors } from '../../src/theme/colors';
import { PhoneInput } from '../../src/components/auth/PhoneInput';
import { isValidPhone } from '../../src/lib/phone';
import { StepContainer } from '../../src/components/register/StepContainer';
import { SerifHeading } from '../../src/components/register/SerifHeading';
import { PrimaryCta } from '../../src/components/register/PrimaryCta';
import { OtpBoxesInput } from '../../src/components/register/OtpBoxesInput';
import { toastApiError } from '../../src/lib/toast';

const APP_VERSION = Constants.expoConfig?.version ?? '—';
const OTP_COOLDOWN = 30;
const CODE_LENGTH = 6;

export default function LoginOtpScreen() {
  const { requestOtp, loginWithOtp } = useAuth();

  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const otpResetRef = useRef(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  useEffect(() => {
    if (!error) return;
    const t2 = setTimeout(() => setError(false), 1400);
    return () => clearTimeout(t2);
  }, [error]);

  const canSendCode = isValidPhone(phone);
  const canVerify = code.length === CODE_LENGTH;

  async function handleSendCode() {
    if (isLoading || !canSendCode) return;
    try {
      setIsLoading(true);
      await requestOtp(phone);
      setStep('code');
      setCooldown(OTP_COOLDOWN);
    } catch (err) {
      toastApiError(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVerify() {
    if (!canVerify || isLoading) return;
    try {
      setIsLoading(true);
      await loginWithOtp(phone, code);
      router.replace('/');
    } catch (err) {
      setError(true);
      setCode('');
      otpResetRef.current += 1;
      toastApiError(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResend() {
    if (cooldown > 0 || isLoading) return;
    try {
      await requestOtp(phone);
      setCooldown(OTP_COOLDOWN);
    } catch (err) {
      toastApiError(err);
    }
  }

  if (step === 'phone') {
    return <PhoneStep
      phone={phone}
      onPhoneChange={setPhone}
      loading={isLoading}
      canSendCode={canSendCode}
      onSendCode={handleSendCode}
    />;
  }

  return (
    <CodeStep
      phone={phone}
      code={code}
      onCodeChange={setCode}
      onVerify={handleVerify}
      onResend={handleResend}
      onBack={() => {
        setStep('phone');
        setCode('');
        setCooldown(0);
      }}
      loading={isLoading}
      canVerify={canVerify}
      cooldown={cooldown}
      hasError={error}
      resetKey={otpResetRef.current}
    />
  );
}

// ─── Phone step ────────────────────────────────────────────────────────────────
interface PhoneStepProps {
  phone: string;
  onPhoneChange: (v: string) => void;
  loading: boolean;
  canSendCode: boolean;
  onSendCode: () => void;
}

function PhoneStep({ phone, onPhoneChange, loading, canSendCode, onSendCode }: PhoneStepProps) {
  const { t } = useTranslation('auth');

  const footer = (
    <View>
      <PrimaryCta
        label={t('loginOtp.sendCode')}
        onPress={onSendCode}
        disabled={!canSendCode}
        loading={loading}
      />

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 18 }}>
        <View style={{ flex: 1, height: 1, backgroundColor: Colors.brand.creamSoft }} />
        <Text
          style={{
            fontFamily: 'Inter_500Medium',
            fontSize: 12,
            color: Colors.brand.navyMuted,
            textTransform: 'uppercase',
            letterSpacing: 1.4,
          }}
        >
          {t('loginOtp.orDivider')}
        </Text>
        <View style={{ flex: 1, height: 1, backgroundColor: Colors.brand.creamSoft }} />
      </View>

      <View
        style={{
          marginTop: 20,
          borderRadius: 999,
          backgroundColor: 'transparent',
          overflow: 'hidden',
        }}
      >
        <Pressable
          onPress={() => router.push('/(auth)/login')}
          accessibilityRole="button"
          style={({ pressed }) => ({
            paddingVertical: 16,
            paddingHorizontal: 20,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <Text
            style={{
              fontFamily: 'Inter_600SemiBold',
              fontSize: 14,
              color: Colors.brand.navy,
              letterSpacing: 0.4,
              textAlign: 'center',
            }}
          >
            {t('loginOtp.signInWithEmail')}
          </Text>
        </Pressable>
      </View>

      <Pressable
        onPress={() => router.replace('/(auth)/register/phone')}
        accessibilityRole="button"
        style={{ alignSelf: 'center', marginTop: 18, paddingVertical: 6 }}
        hitSlop={10}
      >
        <Text
          style={{
            fontFamily: 'Inter_500Medium',
            fontSize: 13,
            color: Colors.brand.navyMuted,
          }}
        >
          {t('loginOtp.noAccount')}{' '}
          <Text style={{ color: Colors.brand.orange, fontFamily: 'Inter_700Bold' }}>
            {t('loginOtp.createAccount')}
          </Text>
        </Text>
      </Pressable>

      <Text
        style={{
          fontFamily: 'Inter_400Regular',
          fontSize: 11,
          color: Colors.brand.navyMuted,
          textAlign: 'center',
          marginTop: 14,
          opacity: 0.6,
        }}
      >
        v{APP_VERSION}
      </Text>
    </View>
  );

  return (
    <StepContainer variant="light" footer={footer}>
      <SerifHeading
        leading={t('loginOtp.phoneTitleLeading')}
        italic={t('loginOtp.phoneTitleItalic')}
        trailing="."
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
        {t('loginOtp.phoneSubtitle')}
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
          {t('loginOtp.phoneLabel')}
        </Text>
        <PhoneInput
          value={phone}
          onChange={onPhoneChange}
          placeholder={t('loginOtp.phonePlaceholderPretty')}
          isDisabled={loading}
        />

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 }}>
          {canSendCode ? (
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
                {t('loginOtp.phoneValid')}
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
                {t('loginOtp.phoneHelper')}
              </Text>
            </View>
          )}
        </View>
      </View>
    </StepContainer>
  );
}

// ─── Code step ─────────────────────────────────────────────────────────────────
interface CodeStepProps {
  phone: string;
  code: string;
  onCodeChange: (v: string) => void;
  onVerify: () => void;
  onResend: () => void;
  onBack: () => void;
  loading: boolean;
  canVerify: boolean;
  cooldown: number;
  hasError: boolean;
  resetKey: number;
}

function CodeStep({
  phone,
  code,
  onCodeChange,
  onVerify,
  onResend,
  onBack,
  loading,
  canVerify,
  cooldown,
  hasError,
  resetKey,
}: CodeStepProps) {
  const { t } = useTranslation('auth');

  const footer = (
    <PrimaryCta
      label={t('loginOtp.verify')}
      onPress={onVerify}
      disabled={!canVerify}
      loading={loading}
    />
  );

  return (
    <StepContainer
      variant="dark"
      showBack
      onBack={onBack}
      footer={footer}
    >
      <SerifHeading
        leading={t('loginOtp.codeTitleLeading')}
        italic={t('loginOtp.codeTitleItalic')}
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
        {t('loginOtp.codeSubtitlePrefix', { count: CODE_LENGTH })}{' '}
        <Text style={{ fontFamily: 'Inter_700Bold', color: '#FFFFFF' }}>
          {formatPhoneForDisplay(phone)}
        </Text>
        . {t('loginOtp.codeSubtitleSuffix')}
      </Text>

      <View style={{ marginTop: 32 }}>
        <OtpBoxesInput
          key={resetKey}
          value={code}
          onChange={onCodeChange}
          length={CODE_LENGTH}
          variant="dark"
          hasError={hasError}
        />
      </View>

      <Pressable
        onPress={onResend}
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
            color: cooldown > 0 ? 'rgba(255,255,255,0.55)' : Colors.brand.orange,
          }}
        >
          {cooldown > 0
            ? t('loginOtp.codeDidntReceive') +
              '  ·  ' +
              t('loginOtp.resendIn', { seconds: cooldown })
            : t('loginOtp.resend')}
        </Text>
      </Pressable>
    </StepContainer>
  );
}

function formatPhoneForDisplay(e164: string): string {
  if (!e164) return '';
  const match = e164.match(/^(\+\d{1,3})(\d{3})(\d{3})(\d{4,})$/);
  if (!match) return e164;
  return `${match[1]} ${match[2]} ${match[3]} ${match[4]}`;
}
