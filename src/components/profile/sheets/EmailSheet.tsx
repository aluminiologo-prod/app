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
    EMAIL_REGEX.test(trimmed) &&
    trimmed.length <= 120 &&
    trimmed !== (initialEmail ?? '');

  const handleSave = async () => {
    setError(null);
    try {
      await mutateAsync({ email: trimmed });
      toastSuccess(t('edit.email.successToast'));
      onClose();
    } catch (err) {
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
      eyebrow={t('edit.eyebrow')}
      titleLeading={t('edit.email.titleLeading')}
      titleItalic={t('edit.email.titleItalic')}
      titleTrailing={t('edit.email.titleTrailing')}
      subtitle={t('edit.email.subtitle')}
      primaryLabel={t('edit.save')}
      onPrimary={handleSave}
      primaryDisabled={!canSave}
      primaryLoading={isPending}
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
