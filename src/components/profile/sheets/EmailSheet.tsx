import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { EditSheetFrame } from '../EditSheetFrame';
import { LabeledInput } from '../LabeledInput';
import { useUpdateMyEmail } from '../../../hooks/queries';
import { toastApiError, toastSuccess } from '../../../lib/toast';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Props {
  isOpen: boolean;
  initialEmail: string | null;
  onClose: () => void;
}

export function EmailSheet({ isOpen, initialEmail, onClose }: Props) {
  const { t } = useTranslation('profile');
  const [email, setEmail] = useState(initialEmail ?? '');
  const [error, setError] = useState<string | null>(null);
  const { mutateAsync, isPending } = useUpdateMyEmail();

  useEffect(() => {
    if (isOpen) {
      setEmail(initialEmail ?? '');
      setError(null);
    }
  }, [isOpen, initialEmail]);

  const trimmed = email.trim().toLowerCase();
  const canSave =
    EMAIL_REGEX.test(trimmed) && trimmed.length <= 120 && trimmed !== (initialEmail ?? '');

  const handleSave = async () => {
    setError(null);
    try {
      await mutateAsync({ email: trimmed });
      toastSuccess(t('edit.email.successToast'));
      onClose();
    } catch (err) {
      // Backend maps unique-violation to 409 — surface a specific message
      // inline, everything else goes to the shared toast.
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setError(t('edit.email.errors.inUse'));
        return;
      }
      toastApiError(err, t('errors.saveFailed'));
    }
  };

  return (
    <EditSheetFrame
      isOpen={isOpen}
      onClose={onClose}
      title={t('edit.email.title')}
      subtitle={t('edit.email.subtitle')}
      primaryLabel={t('edit.email.save')}
      onPrimary={handleSave}
      primaryDisabled={!canSave}
      primaryLoading={isPending}
      snapPoints={['58%', '90%']}
    >
      <LabeledInput
        insideSheet
        label={t('edit.email.email')}
        value={email}
        onChangeText={(v) => {
          setEmail(v);
          setError(null);
        }}
        autoFocus
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        maxLength={120}
        placeholder="hello@example.com"
        returnKeyType="done"
        onSubmitEditing={handleSave}
        error={error}
      />
    </EditSheetFrame>
  );
}
