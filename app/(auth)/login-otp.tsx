import { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, Pressable, KeyboardAvoidingView,
  Platform, ScrollView, ActivityIndicator, Image, useColorScheme,
} from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react-native';
import { useAuth } from '../../src/contexts/AuthContext';
import { Colors } from '../../src/theme/colors';
import { PHONE_COUNTRY_CODES, DEFAULT_COUNTRY_CODE } from '../../src/config/constants';

const LOGO_LIGHT = require('../../assets/logo-light.png');
const LOGO_DARK  = require('../../assets/logo-dark.png');
const OTP_COOLDOWN = 30;

export default function LoginOtpScreen() {
  const { t } = useTranslation('auth');
  const { requestOtp, loginWithOtp } = useAuth();
  const isDark = useColorScheme() === 'dark';

  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [countryDial] = useState(DEFAULT_COUNTRY_CODE);
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const codeInputRef = useRef<TextInput>(null);

  // Countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const fullPhone = `${countryDial}${phone.replace(/\D/g, '')}`;

  async function handleSendCode() {
    if (!phone.trim()) return;
    setError('');
    setIsLoading(true);
    try {
      await requestOtp(fullPhone);
      setStep('code');
      setCooldown(OTP_COOLDOWN);
      setTimeout(() => codeInputRef.current?.focus(), 300);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send code');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVerify() {
    if (code.length !== 6) return;
    setError('');
    setIsLoading(true);
    try {
      await loginWithOtp(fullPhone, code);
      router.replace('/(app)/(tabs)/in-transit');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('loginOtp.invalidCode'));
      setCode('');
    } finally {
      setIsLoading(false);
    }
  }

  const maskedPhone = `${countryDial} ···· ${phone.slice(-4)}`;

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white dark:bg-[#0F1117]"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 justify-center px-6 py-12">
          {/* Logo */}
          <Image
            source={isDark ? LOGO_DARK : LOGO_LIGHT}
            style={{ width: 210, height: 55, marginBottom: 24 }}
            resizeMode="contain"
          />

          {/* Back button */}
          <Pressable
            onPress={() => step === 'code' ? setStep('phone') : router.back()}
            className="flex-row items-center gap-1 mb-8 active:opacity-70 self-start"
          >
            <ArrowLeft size={18} color="#71717A" />
            <Text className="text-sm text-[#71717A]">{t('loginOtp.changePhone')}</Text>
          </Pressable>

          {/* Header */}
          <View className="mb-7">
            <Text className="text-2xl font-bold text-[#11181C] dark:text-[#ECEDEE]">
              {t('loginOtp.title')}
            </Text>
            <Text className="text-sm text-[#71717A] mt-1">
              {step === 'code'
                ? t('loginOtp.codeSent', { phone: maskedPhone })
                : t('loginOtp.subtitle')
              }
            </Text>
          </View>

          {/* Error */}
          {!!error && (
            <View className="bg-[#FEEBE7] border border-[#F9C0B5] rounded-2xl px-4 py-3 mb-5">
              <Text className="text-sm text-[#EC1F00] font-medium">{error}</Text>
            </View>
          )}

          {step === 'phone' ? (
            /* ── STEP 1: Phone input ── */
            <>
              <Text className="text-sm font-medium text-[#11181C] dark:text-[#ECEDEE] mb-2">
                {t('loginOtp.phone')}
              </Text>
              <View className="flex-row gap-2 mb-6">
                {/* Country code picker (simplified) */}
                <View className="border border-[#E4E4E7] dark:border-[#272831] rounded-2xl px-3 py-3.5 bg-white dark:bg-[#18191F] justify-center">
                  <Text className="text-base text-[#11181C] dark:text-[#ECEDEE] font-medium">
                    {PHONE_COUNTRY_CODES.find((c) => c.dial === countryDial)?.label ?? countryDial}
                  </Text>
                </View>
                <View className="flex-1 border border-[#E4E4E7] dark:border-[#272831] rounded-2xl px-4 py-3.5 bg-white dark:bg-[#18191F]">
                  <TextInput
                    className="text-base text-[#11181C] dark:text-[#ECEDEE]"
                    placeholder={t('loginOtp.phonePlaceholder')}
                    placeholderTextColor="#71717A"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    returnKeyType="done"
                    onSubmitEditing={handleSendCode}
                  />
                </View>
              </View>

              <Pressable
                onPress={handleSendCode}
                disabled={isLoading || !phone.trim()}
                className="rounded-2xl py-4 items-center active:opacity-80"
                style={{ backgroundColor: !phone.trim() ? '#B3B7C3' : Colors.primary }}
              >
                {isLoading
                  ? <ActivityIndicator color="white" />
                  : <Text className="text-white font-semibold text-base">{t('loginOtp.sendCode')}</Text>
                }
              </Pressable>
            </>
          ) : (
            /* ── STEP 2: OTP code ── */
            <>
              <Text className="text-sm font-medium text-[#11181C] dark:text-[#ECEDEE] mb-2">
                {t('loginOtp.enterCode')}
              </Text>
              <View className="border border-[#E4E4E7] dark:border-[#272831] rounded-2xl px-4 py-3.5 bg-white dark:bg-[#18191F] mb-6 items-center">
                <TextInput
                  ref={codeInputRef}
                  className="text-3xl font-bold text-[#11181C] dark:text-[#ECEDEE] tracking-[16px] w-full text-center"
                  placeholder="· · · · · ·"
                  placeholderTextColor="#D4D4D8"
                  value={code}
                  onChangeText={(v) => setCode(v.replace(/\D/g, '').slice(0, 6))}
                  keyboardType="number-pad"
                  maxLength={6}
                  returnKeyType="done"
                  onSubmitEditing={handleVerify}
                />
              </View>

              <Pressable
                onPress={handleVerify}
                disabled={isLoading || code.length < 6}
                className="rounded-2xl py-4 items-center mb-4 active:opacity-80"
                style={{ backgroundColor: code.length < 6 ? '#B3B7C3' : Colors.primary }}
              >
                {isLoading
                  ? <ActivityIndicator color="white" />
                  : <Text className="text-white font-semibold text-base">{t('loginOtp.verify')}</Text>
                }
              </Pressable>

              {/* Resend */}
              <Pressable
                onPress={cooldown <= 0 ? handleSendCode : undefined}
                className="items-center active:opacity-70"
                disabled={cooldown > 0}
              >
                <Text className="text-sm" style={{ color: cooldown > 0 ? '#71717A' : Colors.primary }}>
                  {cooldown > 0
                    ? t('loginOtp.resendIn', { seconds: cooldown })
                    : t('loginOtp.resend')
                  }
                </Text>
              </Pressable>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
