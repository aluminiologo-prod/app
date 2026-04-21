import { forwardRef, useEffect, useRef, useState } from 'react';
import {
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react-native';
import { useAuth } from '../../src/contexts/AuthContext';
import { Colors } from '../../src/theme/colors';
import { StepContainer } from '../../src/components/register/StepContainer';
import { SerifHeading } from '../../src/components/register/SerifHeading';
import { PrimaryCta } from '../../src/components/register/PrimaryCta';
import { toastApiError } from '../../src/lib/toast';

export default function LoginScreen() {
  const { t } = useTranslation('auth');
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<'email' | 'password' | null>(null);

  const passwordRef = useRef<TextInput>(null);

  useEffect(() => {
    if (isAuthenticated) router.replace('/');
  }, [isAuthenticated]);

  const canSubmit = email.trim().length > 3 && password.length >= 1;

  const handleLogin = async () => {
    if (!canSubmit || loading) return;
    try {
      setLoading(true);
      await login(email.trim().toLowerCase(), password);
      router.replace('/');
    } catch (err) {
      toastApiError(err, t('login.invalidCredentials'));
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <View>
      <PrimaryCta
        label={t('login.signIn')}
        onPress={handleLogin}
        disabled={!canSubmit}
        loading={loading}
      />

      <Pressable
        onPress={() => router.push('/(auth)/forgot-password')}
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
          {t('login.forgotPassword')}
        </Text>
      </Pressable>

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
          onPress={() => router.replace('/(auth)/login-otp')}
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
            {t('login.useSms')}
          </Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <StepContainer
      variant="light"
      showBack
      onBack={() => router.replace('/(auth)/login-otp')}
      footer={footer}
    >
      <SerifHeading
        leading={t('login.titleLeading')}
        italic={t('login.titleItalic')}
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
        {t('login.newSubtitle')}
      </Text>

      <View style={{ marginTop: 32, gap: 18 }}>
        <IconField
          label={t('login.emailLabel')}
          icon={Mail}
          placeholder={t('login.emailPlaceholder')}
          value={email}
          onChange={setEmail}
          focused={focused === 'email'}
          onFocus={() => setFocused('email')}
          onBlur={() => setFocused(null)}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          autoComplete="email"
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
          autoFocus
        />
        <IconField
          ref={passwordRef}
          label={t('login.passwordLabel')}
          icon={Lock}
          placeholder={t('login.passwordPlaceholder')}
          value={password}
          onChange={setPassword}
          focused={focused === 'password'}
          onFocus={() => setFocused('password')}
          onBlur={() => setFocused(null)}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="password"
          returnKeyType="done"
          onSubmitEditing={handleLogin}
          trailing={
            <Pressable
              onPress={() => setShowPassword((v) => !v)}
              accessibilityRole="button"
              accessibilityLabel={
                showPassword ? t('login.hidePassword') : t('login.showPassword')
              }
              hitSlop={12}
              style={({ pressed }) => ({ opacity: pressed ? 0.5 : 0.75, padding: 4 })}
            >
              {showPassword ? (
                <EyeOff size={18} color={Colors.brand.navyMuted} />
              ) : (
                <Eye size={18} color={Colors.brand.navyMuted} />
              )}
            </Pressable>
          }
        />
      </View>
    </StepContainer>
  );
}

// ─── Field with leading icon + optional trailing slot ─────────────────────────
interface IconFieldProps {
  label: string;
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  focused: boolean;
  onFocus: () => void;
  onBlur: () => void;
  autoFocus?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  keyboardType?: 'default' | 'email-address' | 'number-pad';
  autoComplete?: 'email' | 'password' | 'off';
  secureTextEntry?: boolean;
  returnKeyType?: 'next' | 'done' | 'go';
  onSubmitEditing?: () => void;
  trailing?: React.ReactNode;
}

const IconField = forwardRef<TextInput, IconFieldProps>(function IconField(
  {
    label,
    icon: Icon,
    placeholder,
    value,
    onChange,
    focused,
    onFocus,
    onBlur,
    autoFocus,
    autoCapitalize,
    autoCorrect,
    keyboardType,
    autoComplete,
    secureTextEntry,
    returnKeyType,
    onSubmitEditing,
    trailing,
  },
  ref,
) {
  return (
    <View>
      <Text
        style={{
          fontFamily: 'Inter_600SemiBold',
          fontSize: 11,
          letterSpacing: 1.6,
          color: Colors.brand.navyMuted,
          marginBottom: 8,
        }}
      >
        {label}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          height: 56,
          paddingHorizontal: 16,
          borderRadius: 14,
          borderWidth: 2,
          borderColor: focused ? Colors.brand.orange : Colors.brand.creamSoft,
          backgroundColor: '#FFFFFF',
          shadowColor: focused ? Colors.brand.orange : '#000',
          shadowOpacity: focused ? 0.12 : 0.03,
          shadowRadius: focused ? 10 : 4,
          shadowOffset: { width: 0, height: 4 },
          elevation: focused ? 3 : 1,
        }}
      >
        <Icon
          size={18}
          color={focused ? Colors.brand.orange : Colors.brand.navyMuted}
          strokeWidth={2}
        />
        <TextInput
          ref={ref}
          value={value}
          onChangeText={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          placeholderTextColor={Colors.brand.navyMuted + '99'}
          autoFocus={autoFocus}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          keyboardType={keyboardType}
          autoComplete={autoComplete}
          secureTextEntry={secureTextEntry}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          style={{
            flex: 1,
            marginLeft: 12,
            fontFamily: 'Inter_500Medium',
            fontSize: 16,
            color: Colors.brand.navy,
          }}
        />
        {trailing ?? null}
      </View>
    </View>
  );
});
