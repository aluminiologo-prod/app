import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EditSheetFrame } from '../EditSheetFrame';
import { LabeledInput } from '../LabeledInput';
import { useUpdateMyName } from '../../../hooks/queries';
import { toastApiError, toastSuccess } from '../../../lib/toast';

interface Props {
  isOpen: boolean;
  initialFirstName: string;
  initialLastName: string;
  onClose: () => void;
}

export function NameSheet({ isOpen, initialFirstName, initialLastName, onClose }: Props) {
  const { t } = useTranslation('profile');
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const { mutateAsync, isPending } = useUpdateMyName();

  useEffect(() => {
    if (isOpen) {
      setFirstName(initialFirstName);
      setLastName(initialLastName);
    }
  }, [isOpen, initialFirstName, initialLastName]);

  const canSave =
    firstName.trim().length >= 1 &&
    firstName.trim().length <= 60 &&
    lastName.trim().length >= 1 &&
    lastName.trim().length <= 60 &&
    (firstName.trim() !== initialFirstName || lastName.trim() !== initialLastName);

  const handleSave = async () => {
    try {
      await mutateAsync({ first_name: firstName.trim(), last_name: lastName.trim() });
      toastSuccess(t('edit.name.successToast'));
      onClose();
    } catch (err) {
      toastApiError(err, t('errors.saveFailed'));
    }
  };

  return (
    <EditSheetFrame
      isOpen={isOpen}
      onClose={onClose}
      title={t('edit.name.title')}
      primaryLabel={t('edit.name.save')}
      onPrimary={handleSave}
      primaryDisabled={!canSave}
      primaryLoading={isPending}
    >
      <LabeledInput
        insideSheet
        label={t('edit.name.firstName')}
        value={firstName}
        onChangeText={setFirstName}
        autoFocus
        maxLength={60}
        autoCapitalize="words"
        returnKeyType="next"
      />
      <LabeledInput
        insideSheet
        label={t('edit.name.lastName')}
        value={lastName}
        onChangeText={setLastName}
        maxLength={60}
        autoCapitalize="words"
        returnKeyType="done"
        onSubmitEditing={handleSave}
      />
    </EditSheetFrame>
  );
}
