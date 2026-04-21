import { useEffect, useState } from 'react';
import { Pressable, Text, View, useColorScheme } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react-native';
import { EditSheetFrame } from '../EditSheetFrame';
import { PhoneInput } from '../../auth/PhoneInput';
import { OtpBoxesInput } from '../../register/OtpBoxesInput';
import { isValidPhone } from '../../../lib/phone';
import { supabase } from '../../../lib/supabase';
import { useSyncMyPhone } from '../../../hooks/queries';
import { toastError, toastSuccess } from '../../../lib/toast';
import { Colors } from '../../../theme/colors';

const CODE_LENGTH = 6;

interface Props {
  isOpen: boolean;
  initialPhone: string | null;
  onClose: () => void;
}

type Step = 'phone' | 'code';

export function PhoneSheet({ isOpen, initialPhone, onClose }: Props) {
  const { t } = useTranslation('profile');
  const isDark = useColorScheme() === 'dark';
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [sendingCode, setSendingCode] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { mutateAsync: syncPhone } = useSyncMyPhone();

  useEffect(() => {
    if (isOpen) {
      setStep('phone');
      setPhone(initialPhone ?? '');
      setCode('');
      setError(null);
    }
  }, [isOpen, initialPhone]);

  const canRequestCode =
    isValidPhone(phone) && phone !== (initialPhone ?? '') && !sendingCode;

  const handleRequestCode = async () => {
    if (!canRequestCode) return;
    setError(null);
    setSendingCode(true);
    try {
      const { error: err } = await supabase.auth.updateUser({ phone });
      if (err) throw err;
      setStep('code');
    } catch {
      setError(t('edit.phone.errors.sendFailed'));
    } finally {
      setSendingCode(false);
    }
  };

  const handleVerify = async () => {
    if (code.length !== CODE_LENGTH || verifying) return;
    setError(null);
    setVerifying(true);
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        phone,
        token: code,
        type: 'phone_change',
      });
      if (verifyError) {
        setError(t('edit.phone.errors.verifyFailed'));
        setCode('');
        return;
      }
      try {
        await syncPhone();
      } catch {
        toastError(t('edit.phone.errors.syncFailed'));
        return;
      }
      toastSuccess(t('edit.phone.successToast'));
      onClose();
    } finally {
      setVerifying(false);
    }
  };

  const onBackToPhone = () => {
    setStep('phone');
    setCode('');
    setError(null);
  };

  const labelColor = isDark ? '#9BA1B0' : Colors.brand.navyMuted;

  if (step === 'phone') {
    return (
      <EditSheetFrame
        isOpen={isOpen}
        onClose={onClose}
        eyebrow={t('edit.eyebrow')}
        titleLeading={t('edit.phone.titleLeading')}
        titleItalic={t('edit.phone.titleItalic')}
        titleTrailing={t('edit.phone.titleTrailing')}
        subtitle={t('edit.phone.subtitle')}
        primaryLabel={t('edit.phone.sendCode')}
        onPrimary={handleRequestCode}
        primaryDisabled={!canRequestCode}
        primaryLoading={sendingCode}
      >
        <PhoneInput value={phone} onChange={setPhone} />
        {error ? (
          <Text
            style={{
              fontFamily: 'Inter_500Medium',
              fontSize: 13,
              color: Colors.danger,
              marginTop: 4,
            }}
          >
            {error}
          </Text>
        ) : null}
      </EditSheetFrame>
    );
  }

  return (
    <EditSheetFrame
      isOpen={isOpen}
      onClose={onClose}
      eyebrow={t('edit.eyebrow')}
      titleLeading={t('edit.phone.codeTitleLeading')}
      titleItalic={t('edit.phone.codeTitleItalic')}
      subtitle={t('edit.phone.codeSubtitle', { phone })}
      primaryLabel={t('edit.phone.verify')}
      onPrimary={handleVerify}
      primaryDisabled={code.length !== CODE_LENGTH}
      primaryLoading={verifying}
      cancelLabel={t('edit.phone.back')}
    >
      <Text
        style={{
          fontFamily: 'Inter_700Bold',
          fontSize: 11,
          letterSpacing: 1.2,
          textTransform: 'uppercase',
          color: labelColor,
          marginBottom: 12,
        }}
      >
        {t('edit.phone.codeLabel')}
      </Text>
      <View style={{ alignItems: 'center' }}>
        <OtpBoxesInput
          value={code}
          onChange={setCode}
          length={CODE_LENGTH}
          variant="light"
        />
      </View>
      {error ? (
        <Text
          style={{
            fontFamily: 'Inter_500Medium',
            fontSize: 13,
            color: Colors.danger,
            marginTop: 12,
            textAlign: 'center',
          }}
        >
          {error}
        </Text>
      ) : null}

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 18,
        }}
      >
        <Pressable
          onPress={onBackToPhone}
          accessibilityRole="button"
          hitSlop={10}
          style={{ flexDirection: 'row', alignItems: 'center' }}
        >
          <ArrowLeft size={14} color={Colors.brand.navyMuted} />
          <Text
            style={{
              fontFamily: 'Inter_600SemiBold',
              fontSize: 12,
              color: Colors.brand.navyMuted,
              marginLeft: 4,
            }}
          >
            {t('edit.phone.back')}
          </Text>
        </Pressable>
        <Pressable
          onPress={handleRequestCode}
          accessibilityRole="button"
          hitSlop={10}
          disabled={sendingCode}
        >
          <Text
            style={{
              fontFamily: 'Inter_700Bold',
              fontSize: 12,
              letterSpacing: 0.6,
              textTransform: 'uppercase',
              color: sendingCode ? Colors.brand.navyMuted : Colors.brand.orange,
            }}
          >
            {t('edit.phone.resend')}
          </Text>
        </Pressable>
      </View>
    </EditSheetFrame>
  );
}
