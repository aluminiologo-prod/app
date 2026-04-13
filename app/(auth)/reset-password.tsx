import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Pressable, KeyboardAvoidingView,
  Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Lock, Eye, EyeOff, AlertCircle } from 'lucide-react-native';
import { supabase } from '../../src/lib/supabase';
import { Colors } from '../../src/theme/colors';

export default function ResetPasswordScreen() {
  const { t } = useTranslation('auth');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [sessionReady, setSessionReady] = useState(false);

  // Detect the PASSWORD_RECOVERY session from the deep link
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSave() {
    setError('');
    if (password.length < 8) {
      setError(t('resetPassword.tooShort'));
      return;
    }
    if (password !== confirm) {
      setError(t('resetPassword.mismatch'));
      return;
    }

    setIsLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw new Error(updateError.message);
      await supabase.auth.signOut();
      router.replace('/(auth)/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  }

  if (!sessionReady) {
    return (
      <View className="flex-1 bg-white dark:bg-[#0F1117] items-center justify-center px-6">
        <View className="w-14 h-14 rounded-full bg-[#FEEBE7] items-center justify-center mb-4">
          <AlertCircle size={28} color={Colors.danger} />
        </View>
        <Text className="text-lg font-bold text-[#11181C] dark:text-[#ECEDEE] text-center mb-2">
          Invalid Link
        </Text>
        <Text className="text-sm text-[#71717A] text-center mb-6">
          {t('resetPassword.invalidLink')}
        </Text>
        <Pressable
          onPress={() => router.replace('/(auth)/forgot-password')}
          className="rounded-2xl py-4 px-8 items-center active:opacity-80"
          style={{ backgroundColor: Colors.primary }}
        >
          <Text className="text-white font-semibold">Request new link</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white dark:bg-[#0F1117]"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 justify-center px-6 py-12">
          <View className="items-center mb-10">
            <View className="w-16 h-16 rounded-2xl items-center justify-center mb-4"
              style={{ backgroundColor: Colors.primaryLight }}>
              <Lock size={28} color={Colors.primary} />
            </View>
            <Text className="text-2xl font-bold text-[#11181C] dark:text-[#ECEDEE]">
              {t('resetPassword.title')}
            </Text>
            <Text className="text-sm text-[#71717A] mt-1">{t('resetPassword.subtitle')}</Text>
          </View>

          {!!error && (
            <View className="bg-[#FEEBE7] border border-[#F9C0B5] rounded-2xl px-4 py-3 mb-5">
              <Text className="text-sm text-[#EC1F00] font-medium">{error}</Text>
            </View>
          )}

          {/* New password */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-[#11181C] dark:text-[#ECEDEE] mb-2">
              {t('resetPassword.password')}
            </Text>
            <View className="flex-row items-center border border-[#E4E4E7] dark:border-[#272831] rounded-2xl px-4 py-3.5 bg-white dark:bg-[#18191F]">
              <Lock size={18} color="#71717A" />
              <TextInput
                className="flex-1 ml-3 text-base text-[#11181C] dark:text-[#ECEDEE]"
                placeholder={t('resetPassword.passwordPlaceholder')}
                placeholderTextColor="#71717A"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPwd}
                returnKeyType="next"
              />
              <Pressable onPress={() => setShowPwd(!showPwd)} className="ml-2 active:opacity-70">
                {showPwd ? <EyeOff size={18} color="#71717A" /> : <Eye size={18} color="#71717A" />}
              </Pressable>
            </View>
          </View>

          {/* Confirm */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-[#11181C] dark:text-[#ECEDEE] mb-2">
              {t('resetPassword.confirm')}
            </Text>
            <View className="flex-row items-center border border-[#E4E4E7] dark:border-[#272831] rounded-2xl px-4 py-3.5 bg-white dark:bg-[#18191F]">
              <Lock size={18} color="#71717A" />
              <TextInput
                className="flex-1 ml-3 text-base text-[#11181C] dark:text-[#ECEDEE]"
                placeholder={t('resetPassword.confirmPlaceholder')}
                placeholderTextColor="#71717A"
                value={confirm}
                onChangeText={setConfirm}
                secureTextEntry={!showConfirm}
                returnKeyType="done"
                onSubmitEditing={handleSave}
              />
              <Pressable onPress={() => setShowConfirm(!showConfirm)} className="ml-2 active:opacity-70">
                {showConfirm ? <EyeOff size={18} color="#71717A" /> : <Eye size={18} color="#71717A" />}
              </Pressable>
            </View>
          </View>

          <Pressable
            onPress={handleSave}
            disabled={isLoading || !password || !confirm}
            className="rounded-2xl py-4 items-center active:opacity-80"
            style={{ backgroundColor: (!password || !confirm) ? '#B3B7C3' : Colors.primary }}
          >
            {isLoading
              ? <ActivityIndicator color="white" />
              : <Text className="text-white font-semibold text-base">{t('resetPassword.save')}</Text>
            }
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
