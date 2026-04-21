import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EditSheetFrame } from '../EditSheetFrame';
import { LabeledInput } from '../LabeledInput';
import { useUpdateMyAddress } from '../../../hooks/queries';
import { toastApiError, toastSuccess } from '../../../lib/toast';

interface Props {
  isOpen: boolean;
  initialAddress: string | null;
  initialCity: string | null;
  onClose: () => void;
}

export function AddressSheet({
  isOpen,
  initialAddress,
  initialCity,
  onClose,
}: Props) {
  const { t } = useTranslation('profile');
  const [address, setAddress] = useState(initialAddress ?? '');
  const [city, setCity] = useState(initialCity ?? '');
  const { mutateAsync, isPending } = useUpdateMyAddress();

  useEffect(() => {
    if (isOpen) {
      setAddress(initialAddress ?? '');
      setCity(initialCity ?? '');
    }
  }, [isOpen, initialAddress, initialCity]);

  const trimmedAddress = address.trim();
  const trimmedCity = city.trim();
  const canSave =
    trimmedAddress.length >= 10 &&
    trimmedAddress.length <= 500 &&
    trimmedCity.length <= 80 &&
    (trimmedAddress !== (initialAddress ?? '') ||
      trimmedCity !== (initialCity ?? ''));

  const handleSave = async () => {
    try {
      await mutateAsync({
        address: trimmedAddress,
        city: trimmedCity.length > 0 ? trimmedCity : undefined,
      });
      toastSuccess(t('edit.address.successToast'));
      onClose();
    } catch (err) {
      toastApiError(err, t('errors.saveFailed'));
    }
  };

  return (
    <EditSheetFrame
      isOpen={isOpen}
      onClose={onClose}
      eyebrow={t('edit.eyebrow')}
      titleLeading={t('edit.address.titleLeading')}
      titleItalic={t('edit.address.titleItalic')}
      titleTrailing={t('edit.address.titleTrailing')}
      subtitle={t('edit.address.subtitle')}
      primaryLabel={t('edit.save')}
      onPrimary={handleSave}
      primaryDisabled={!canSave}
      primaryLoading={isPending}
    >
      <LabeledInput
        insideSheet
        label={t('edit.address.address')}
        value={address}
        onChangeText={setAddress}
        autoFocus
        multiline
        numberOfLines={3}
        maxLength={500}
        placeholder={t('edit.address.addressPlaceholder')}
      />
      <LabeledInput
        insideSheet
        label={t('edit.address.city')}
        value={city}
        onChangeText={setCity}
        maxLength={80}
        placeholder={t('edit.address.cityPlaceholder')}
        returnKeyType="done"
        onSubmitEditing={handleSave}
      />
    </EditSheetFrame>
  );
}
