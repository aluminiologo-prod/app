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

/**
 * Two-step phone change: the mobile app runs the OTP natively through
 * Supabase (`supabase.auth.updateUser({ phone })` → SMS → `verifyOtp`), and
 * once verified we ask the backend to sync the verified number into
 * `clients.phone`. The backend reads the value from `auth.users` itself, so
 * the user can never forge the new phone.
 */
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
      // Supabase's updateUser triggers a phone-change OTP when the phone
      // differs from the one on the auth user. The session is already active
      // so no Bearer work needed.
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
      // Phone is now verified at the auth layer. Ask the backend to pull it
      // into `clients.phone`.
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

  const titleColor = isDark ? '#ECEDEE' : Colors.brand.navy;

  if (step === 'phone') {
    return (
      <EditSheetFrame
        isOpen={isOpen}
        onClose={onClose}
        title={t('edit.phone.title')}
        subtitle={t('edit.phone.subtitle')}
        primaryLabel={t('edit.phone.sendCode')}
        onPrimary={handleRequestCode}
        primaryDisabled={!canRequestCode}
        primaryLoading={sendingCode}
        snapPoints={['70%', '95%']}
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
      title={t('edit.phone.title')}
      subtitle={t('edit.phone.codeSentTo', { phone })}
      primaryLabel={t('edit.phone.verify')}
      onPrimary={handleVerify}
      primaryDisabled={code.length !== CODE_LENGTH}
      primaryLoading={verifying}
      snapPoints={['70%', '95%']}
    >
      <Pressable
        onPress={onBackToPhone}
        accessibilityRole="button"
        hitSlop={10}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 18,
          alignSelf: 'flex-start',
        }}
      >
        <ArrowLeft size={16} color={Colors.brand.orange} />
        <Text
          style={{
            fontFamily: 'Inter_600SemiBold',
            fontSize: 13,
            color: Colors.brand.orange,
            marginLeft: 6,
          }}
        >
          {t('edit.phone.title')}
        </Text>
      </Pressable>

      <Text
        style={{
          fontFamily: 'Inter_600SemiBold',
          fontSize: 12,
          letterSpacing: 0.6,
          textTransform: 'uppercase',
          color: isDark ? '#C7CBD4' : Colors.brand.navyMuted,
          marginBottom: 10,
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

      <Pressable
        onPress={handleRequestCode}
        accessibilityRole="button"
        hitSlop={10}
        style={{ alignSelf: 'center', marginTop: 18, paddingVertical: 4 }}
        disabled={sendingCode}
      >
        <Text
          style={{
            fontFamily: 'Inter_600SemiBold',
            fontSize: 13,
            color: sendingCode ? Colors.brand.navyMuted : titleColor,
          }}
        >
          {t('edit.phone.resend')}
        </Text>
      </Pressable>
    </EditSheetFrame>
  );
}
