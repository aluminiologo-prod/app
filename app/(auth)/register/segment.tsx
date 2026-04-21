import { useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { AlertCircle } from 'lucide-react-native';
import { StepContainer } from '../../../src/components/register/StepContainer';
import { SerifHeading } from '../../../src/components/register/SerifHeading';
import { PrimaryCta } from '../../../src/components/register/PrimaryCta';
import { SelectableCard } from '../../../src/components/register/SelectableCard';
import { ConfirmModal } from '../../../src/components/ui/ConfirmModal';
import { useRegister } from '../../../src/contexts/RegisterContext';
import { useAuth } from '../../../src/contexts/AuthContext';
import { usePublicClientTypesList } from '../../../src/hooks/queries';
import { completeRegistration } from '../../../src/services/registration.service';
import { resolveIcon } from '../../../src/lib/iconRegistry';
import { toastApiError, toastSuccess } from '../../../src/lib/toast';
import { Colors } from '../../../src/theme/colors';

export default function RegisterSegmentScreen() {
  const { t } = useTranslation('auth');
  const {
    phone,
    firstName,
    lastName,
    clientTypeId,
    tokens,
    setClientTypeId,
    reset,
  } = useRegister();
  const { applyLoginResponse } = useAuth();

  const [loading, setLoading] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  const {
    data: clientTypes,
    isLoading: typesLoading,
    isError: typesError,
    refetch,
  } = usePublicClientTypesList();

  const canContinue = clientTypeId !== null;

  const handleComplete = async () => {
    if (!canContinue || loading || !clientTypeId) return;
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
        clientTypeId,
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

        {typesLoading ? (
          <View style={{ marginTop: 48, alignItems: 'center' }}>
            <ActivityIndicator color={Colors.brand.orange} size="large" />
          </View>
        ) : typesError || !clientTypes ? (
          <View
            style={{
              marginTop: 36,
              padding: 18,
              borderRadius: 14,
              backgroundColor: Colors.brand.creamSoft,
              flexDirection: 'row',
              gap: 12,
              alignItems: 'flex-start',
            }}
          >
            <AlertCircle size={20} color={Colors.danger} strokeWidth={2} />
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 14,
                  color: Colors.brand.navy,
                  marginBottom: 4,
                }}
              >
                {t('register.step4.loadError')}
              </Text>
              <Text
                onPress={() => refetch()}
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 13,
                  color: Colors.brand.orange,
                  marginTop: 4,
                }}
              >
                {t('register.step4.retry')}
              </Text>
            </View>
          </View>
        ) : (
          <View
            style={{
              marginTop: 32,
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            {clientTypes.map((ct) => (
              <View key={ct.id} style={{ width: '47%', flexGrow: 1 }}>
                <SelectableCard
                  icon={resolveIcon(ct.icon_name)}
                  title={ct.name}
                  description={ct.description ?? ''}
                  selected={clientTypeId === ct.id}
                  onPress={() =>
                    setClientTypeId(clientTypeId === ct.id ? null : ct.id)
                  }
                />
              </View>
            ))}
          </View>
        )}
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
