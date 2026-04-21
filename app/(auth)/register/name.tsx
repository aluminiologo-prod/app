import { forwardRef, useRef, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StepContainer } from '../../../src/components/register/StepContainer';
import { SerifHeading } from '../../../src/components/register/SerifHeading';
import { PrimaryCta } from '../../../src/components/register/PrimaryCta';
import { useRegister } from '../../../src/contexts/RegisterContext';
import { Colors } from '../../../src/theme/colors';

const MIN_LEN = 2;

export default function RegisterNameScreen() {
  const { t } = useTranslation('auth');
  const { firstName, lastName, setName } = useRegister();

  const [localFirst, setLocalFirst] = useState(firstName);
  const [localLast, setLocalLast] = useState(lastName);
  const [focused, setFocused] = useState<'first' | 'last' | null>('first');

  const lastRef = useRef<TextInput>(null);

  const cleanFirst = localFirst.trim();
  const cleanLast = localLast.trim();
  const canContinue = cleanFirst.length >= MIN_LEN && cleanLast.length >= MIN_LEN;

  const handleContinue = () => {
    if (!canContinue) return;
    setName(cleanFirst, cleanLast);
    router.push('/(auth)/register/segment');
  };

  const footer = (
    <PrimaryCta
      label={t('register.step3.cta')}
      onPress={handleContinue}
      disabled={!canContinue}
    />
  );

  return (
    <StepContainer
      step={3}
      variant="light"
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
        {'—  ' + t('register.stepIndicator', { current: 3, total: 4 })}
      </Text>

      <SerifHeading
        leading={t('register.step3.titleLeading')}
        italic={t('register.step3.titleItalic')}
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
        {t('register.step3.subtitle')}
      </Text>

      <View style={{ marginTop: 32, gap: 18 }}>
        <Field
          label={t('register.step3.firstNameLabel')}
          placeholder={t('register.step3.firstNamePlaceholder')}
          value={localFirst}
          onChange={setLocalFirst}
          focused={focused === 'first'}
          onFocus={() => setFocused('first')}
          onBlur={() => setFocused(null)}
          autoFocus
          returnKeyType="next"
          onSubmitEditing={() => lastRef.current?.focus()}
        />
        <Field
          ref={lastRef}
          label={t('register.step3.lastNameLabel')}
          placeholder={t('register.step3.lastNamePlaceholder')}
          value={localLast}
          onChange={setLocalLast}
          focused={focused === 'last'}
          onFocus={() => setFocused('last')}
          onBlur={() => setFocused(null)}
          returnKeyType="done"
          onSubmitEditing={handleContinue}
        />
      </View>
    </StepContainer>
  );
}

interface FieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  focused: boolean;
  onFocus: () => void;
  onBlur: () => void;
  autoFocus?: boolean;
  returnKeyType?: 'next' | 'done';
  onSubmitEditing?: () => void;
}

const Field = forwardRef<TextInput, FieldProps>(function Field(
  {
    label,
    placeholder,
    value,
    onChange,
    focused,
    onFocus,
    onBlur,
    autoFocus,
    returnKeyType,
    onSubmitEditing,
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
      <TextInput
        ref={ref}
        value={value}
        onChangeText={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        placeholderTextColor={Colors.brand.navyMuted + '99'}
        autoFocus={autoFocus}
        autoCapitalize="words"
        autoCorrect={false}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
        style={{
          height: 56,
          paddingHorizontal: 18,
          borderRadius: 14,
          borderWidth: 2,
          borderColor: focused ? Colors.brand.orange : Colors.brand.creamSoft,
          backgroundColor: '#FFFFFF',
          fontFamily: 'Inter_500Medium',
          fontSize: 16,
          color: Colors.brand.navy,
          shadowColor: focused ? Colors.brand.orange : '#000',
          shadowOpacity: focused ? 0.12 : 0.03,
          shadowRadius: focused ? 10 : 4,
          shadowOffset: { width: 0, height: 4 },
          elevation: focused ? 3 : 1,
        }}
      />
    </View>
  );
});
