import { useState } from 'react';
import {
  View, Text, TextInput, Pressable, KeyboardAvoidingView,
  Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react-native';
import { useAuth } from '../../src/contexts/AuthContext';
import { Colors } from '../../src/theme/colors';

export default function ForgotPasswordScreen() {
  const { t } = useTranslation('auth');
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSend() {
    if (!email.trim()) return;
    setError('');
    setIsLoading(true);
    try {
      await forgotPassword(email.trim().toLowerCase());
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset link');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white dark:bg-[#0F1117]"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 justify-center px-6 py-12">
          <Pressable onPress={() => router.back()} className="flex-row items-center gap-1 mb-8 active:opacity-70 self-start">
            <ArrowLeft size={18} color="#71717A" />
            <Text className="text-sm text-[#71717A]">{t('resetPassword.save')}</Text>
          </Pressable>

          {sent ? (
            /* Success state */
            <View className="items-center">
              <View className="w-16 h-16 rounded-full items-center justify-center mb-5"
                style={{ backgroundColor: '#E8F8E3' }}>
                <CheckCircle size={32} color={Colors.success} />
              </View>
              <Text className="text-2xl font-bold text-[#11181C] dark:text-[#ECEDEE] text-center mb-3">
                {t('forgotPassword.successTitle')}
              </Text>
              <Text className="text-sm text-[#71717A] text-center mb-8 leading-5">
                {t('forgotPassword.successMessage')}
              </Text>
              <Pressable
                onPress={() => router.replace('/(auth)/login')}
                className="w-full rounded-2xl py-4 items-center active:opacity-80"
                style={{ backgroundColor: Colors.primary }}
              >
                <Text className="text-white font-semibold text-base">{t('forgotPassword.backToLogin')}</Text>
              </Pressable>
            </View>
          ) : (
            /* Form state */
            <>
              <View className="items-center mb-10">
                <View className="w-16 h-16 rounded-2xl items-center justify-center mb-4"
                  style={{ backgroundColor: Colors.primaryLight }}>
                  <Mail size={28} color={Colors.primary} />
                </View>
                <Text className="text-2xl font-bold text-[#11181C] dark:text-[#ECEDEE]">
                  {t('forgotPassword.title')}
                </Text>
                <Text className="text-sm text-[#71717A] mt-1 text-center">{t('forgotPassword.subtitle')}</Text>
              </View>

              {!!error && (
                <View className="bg-[#FEEBE7] border border-[#F9C0B5] rounded-2xl px-4 py-3 mb-5">
                  <Text className="text-sm text-[#EC1F00] font-medium">{error}</Text>
                </View>
              )}

              <View className="mb-6">
                <Text className="text-sm font-medium text-[#11181C] dark:text-[#ECEDEE] mb-2">
                  {t('forgotPassword.email')}
                </Text>
                <View className="flex-row items-center border border-[#E4E4E7] dark:border-[#272831] rounded-2xl px-4 py-3.5 bg-white dark:bg-[#18191F]">
                  <Mail size={18} color="#71717A" />
                  <TextInput
                    className="flex-1 ml-3 text-base text-[#11181C] dark:text-[#ECEDEE]"
                    placeholder={t('forgotPassword.emailPlaceholder')}
                    placeholderTextColor="#71717A"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="done"
                    onSubmitEditing={handleSend}
                  />
                </View>
              </View>

              <Pressable
                onPress={handleSend}
                disabled={isLoading || !email.trim()}
                className="rounded-2xl py-4 items-center active:opacity-80"
                style={{ backgroundColor: !email.trim() ? '#B3B7C3' : Colors.primary }}
              >
                {isLoading
                  ? <ActivityIndicator color="white" />
                  : <Text className="text-white font-semibold text-base">{t('forgotPassword.sendLink')}</Text>
                }
              </Pressable>

              <Pressable onPress={() => router.back()} className="items-center mt-4 active:opacity-70">
                <Text className="text-sm text-[#71717A]">{t('forgotPassword.backToLogin')}</Text>
              </Pressable>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
