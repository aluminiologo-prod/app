import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { User, Building2 } from 'lucide-react-native';
import { EditSheetFrame } from '../EditSheetFrame';
import { SelectableCard } from '../../register/SelectableCard';
import { useUpdateMyPersonType } from '../../../hooks/queries';
import { toastApiError, toastSuccess } from '../../../lib/toast';
import type { PersonType } from '../../../types/client';

interface Props {
  isOpen: boolean;
  initialPersonType: PersonType | null;
  onClose: () => void;
}

export function PersonTypeSheet({ isOpen, initialPersonType, onClose }: Props) {
  const { t } = useTranslation('profile');
  const [selected, setSelected] = useState<PersonType | null>(initialPersonType);
  const { mutateAsync, isPending } = useUpdateMyPersonType();

  useEffect(() => {
    if (isOpen) setSelected(initialPersonType);
  }, [isOpen, initialPersonType]);

  const canSave = selected !== null && selected !== initialPersonType;

  const handleSave = async () => {
    if (!selected) return;
    try {
      await mutateAsync({ person_type: selected });
      toastSuccess(t('edit.personType.successToast'));
      onClose();
    } catch (err) {
      toastApiError(err, t('errors.saveFailed'));
    }
  };

  return (
    <EditSheetFrame
      isOpen={isOpen}
      onClose={onClose}
      title={t('edit.personType.title')}
      subtitle={t('edit.personType.subtitle')}
      primaryLabel={t('edit.personType.save')}
      onPrimary={handleSave}
      primaryDisabled={!canSave}
      primaryLoading={isPending}
      snapPoints={['60%', '90%']}
    >
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <SelectableCard
          icon={User}
          title={t('edit.personType.INDIVIDUAL.title')}
          description={t('edit.personType.INDIVIDUAL.description')}
          selected={selected === 'INDIVIDUAL'}
          onPress={() => setSelected('INDIVIDUAL')}
        />
        <SelectableCard
          icon={Building2}
          title={t('edit.personType.BUSINESS.title')}
          description={t('edit.personType.BUSINESS.description')}
          selected={selected === 'BUSINESS'}
          onPress={() => setSelected('BUSINESS')}
        />
      </View>
    </EditSheetFrame>
  );
}
