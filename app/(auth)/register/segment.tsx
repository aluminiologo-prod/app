import { useState } from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { Wrench, LayoutGrid, Package, User } from 'lucide-react-native';
import { StepContainer } from '../../../src/components/register/StepContainer';
import { SerifHeading } from '../../../src/components/register/SerifHeading';
import { PrimaryCta } from '../../../src/components/register/PrimaryCta';
import { SelectableCard } from '../../../src/components/register/SelectableCard';
import { ConfirmModal } from '../../../src/components/ui/ConfirmModal';
import { useRegister } from '../../../src/contexts/RegisterContext';
import { useAuth } from '../../../src/contexts/AuthContext';
import { completeRegistration, type ClientSegment } from '../../../src/services/registration.service';
import { toastApiError, toastSuccess } from '../../../src/lib/toast';
import { Colors } from '../../../src/theme/colors';

const SEGMENT_OPTIONS: {
  value: ClientSegment;
  icon: typeof Wrench;
  titleKey: string;
  descKey: string;
}[] = [
  { value: 'INSTALLER', icon: Wrench,     titleKey: 'installer.title', descKey: 'installer.description' },
  { value: 'GLAZIER',   icon: LayoutGrid, titleKey: 'glazier.title',   descKey: 'glazier.description'   },
  { value: 'WHOLESALE', icon: Package,    titleKey: 'wholesale.title', descKey: 'wholesale.description' },
  { value: 'PERSONAL',  icon: User,       titleKey: 'personal.title',  descKey: 'personal.description'  },
];

export default function RegisterSegmentScreen() {
  const { t } = useTranslation('auth');
  const {
    phone,
    firstName,
    lastName,
    segment,
    tokens,
    setSegment,
    reset,
  } = useRegister();
  const { applyLoginResponse } = useAuth();

  const [loading, setLoading] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  const canContinue = segment !== null;

  const handleComplete = async () => {
    if (!canContinue || loading) return;
    if (!tokens) {
      toastApiError(new Error('Missing registration session. Please start over.'));
      router.replace('/(auth)/register/phone');
      return;
    }
    try {
      setLoading(true);
      const response = await completeRegistration({
        bearerToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        phone,
        firstName,
        lastName,
        segment,
      });
      await applyLoginResponse(response);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(auth)/register/welcome');
    } catch (err) {
      toastApiError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmClose = () => {
    setShowCloseConfirm(false);
    reset();
    toastSuccess(t('register.step4.cancelledToast'));
    router.replace('/(auth)/login-otp');
  };

  const footer = (
    <PrimaryCta
      label={t('register.step4.cta')}
      onPress={handleComplete}
      disabled={!canContinue}
      loading={loading}
      icon="check"
    />
  );

  return (
    <>
      <StepContainer
        step={4}
        variant="light"
        onBack={() => router.back()}
        onClose={() => setShowCloseConfirm(true)}
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
          {'—  ' + t('register.stepIndicator', { current: 4, total: 4 })}
        </Text>

        <SerifHeading
          leading={t('register.step4.titleLeading')}
          italic={t('register.step4.titleItalic')}
          trailing={t('register.step4.titleTrailing')}
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
          {t('register.step4.subtitle')}
        </Text>

        <View
          style={{
            marginTop: 32,
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          {SEGMENT_OPTIONS.map((opt) => (
            <View
              key={opt.value}
              style={{ width: '47%', flexGrow: 1 }}
            >
              <SelectableCard
                icon={opt.icon}
                title={t(`register.step4.segments.${opt.titleKey}`)}
                description={t(`register.step4.segments.${opt.descKey}`)}
                selected={segment === opt.value}
                onPress={() => setSegment(segment === opt.value ? null : opt.value)}
              />
            </View>
          ))}
        </View>
      </StepContainer>

      <ConfirmModal
        isOpen={showCloseConfirm}
        onClose={() => setShowCloseConfirm(false)}
        onConfirm={handleConfirmClose}
        title={t('register.step4.exitTitle')}
        message={t('register.step4.exitMessage')}
        confirmLabel={t('register.step4.exitConfirm')}
        confirmColor="danger"
      />
    </>
  );
}
