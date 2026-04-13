import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Pressable, KeyboardAvoidingView,
  Platform, ScrollView, ActivityIndicator, Image, useColorScheme,
} from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react-native';
import { useAuth } from '../../src/contexts/AuthContext';
import { Colors } from '../../src/theme/colors';

const LOGO_LIGHT = require('../../assets/logo-light.png');
const LOGO_DARK  = require('../../assets/logo-dark.png');

export default function LoginScreen() {
  const { t } = useTranslation('auth');
  const { login, isAuthenticated } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Already logged in → go to app (use an effect to avoid render-phase side-effects)
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(app)/(tabs)/in-transit');
    }
  }, [isAuthenticated]);

  async function handleLogin() {
    if (!email.trim() || !password) return;
    setError('');
    setIsLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      router.replace('/(app)/(tabs)/in-transit');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('login.invalidCredentials'));
    } finally {
      setIsLoading(false);
    }
  }

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
          {/* Logo / Brand */}
          <View className="items-start mb-8">
            <Image
              source={isDark ? LOGO_DARK : LOGO_LIGHT}
              style={{ width: 210, height: 55 }}
              resizeMode="contain"
            />
          </View>

          {/* Headline */}
          <View className="mb-7">
            <Text className="text-2xl font-bold text-[#11181C] dark:text-[#ECEDEE]">
              {t('login.title')}
            </Text>
            <Text className="text-sm text-[#71717A] mt-1">{t('login.subtitle')}</Text>
          </View>

          {/* Error banner */}
          {!!error && (
            <View className="bg-[#FEEBE7] border border-[#F9C0B5] rounded-2xl px-4 py-3 mb-5">
              <Text className="text-sm text-[#EC1F00] font-medium">{error}</Text>
            </View>
          )}

          {/* Email field */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-[#11181C] dark:text-[#ECEDEE] mb-2">
              {t('login.email')}
            </Text>
            <View className="flex-row items-center border border-[#E4E4E7] dark:border-[#272831] rounded-2xl px-4 py-3.5 bg-white dark:bg-[#18191F]">
              <Mail size={18} color="#71717A" />
              <TextInput
                className="flex-1 ml-3 text-base text-[#11181C] dark:text-[#ECEDEE]"
                placeholder={t('login.emailPlaceholder')}
                placeholderTextColor="#71717A"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>
          </View>

          {/* Password field */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-[#11181C] dark:text-[#ECEDEE] mb-2">
              {t('login.password')}
            </Text>
            <View className="flex-row items-center border border-[#E4E4E7] dark:border-[#272831] rounded-2xl px-4 py-3.5 bg-white dark:bg-[#18191F]">
              <Lock size={18} color="#71717A" />
              <TextInput
                className="flex-1 ml-3 text-base text-[#11181C] dark:text-[#ECEDEE]"
                placeholder={t('login.passwordPlaceholder')}
                placeholderTextColor="#71717A"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} className="ml-2 active:opacity-70">
                {showPassword
                  ? <EyeOff size={18} color="#71717A" />
                  : <Eye size={18} color="#71717A" />
                }
              </Pressable>
            </View>
          </View>

          {/* Sign in button */}
          <Pressable
            onPress={handleLogin}
            disabled={isLoading || !email || !password}
            className="rounded-2xl py-4 items-center mb-4 active:opacity-80"
            style={{
              backgroundColor: (!email || !password) ? '#B3B7C3' : Colors.primary,
            }}
          >
            {isLoading
              ? <ActivityIndicator color="white" />
              : <Text className="text-white font-semibold text-base">{t('login.signIn')}</Text>
            }
          </Pressable>

          {/* Links */}
          <View className="items-center gap-3">
            <Pressable onPress={() => router.push('/(auth)/forgot-password')} className="active:opacity-70">
              <Text className="text-sm text-[#71717A]">{t('login.forgotPassword')}</Text>
            </Pressable>

            <View className="flex-row items-center gap-3 w-full my-1">
              <View className="flex-1 h-px bg-[#E4E4E7]" />
              <Text className="text-xs text-[#71717A]">or</Text>
              <View className="flex-1 h-px bg-[#E4E4E7]" />
            </View>

            <Pressable
              onPress={() => router.push('/(auth)/login-otp')}
              className="w-full border border-[#E4E4E7] dark:border-[#272831] rounded-2xl py-4 items-center active:opacity-70"
            >
              <Text className="text-sm font-medium text-[#31374A] dark:text-[#9BA1B0]">
                {t('login.signInWithSMS')}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
