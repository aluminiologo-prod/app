import { createElement, useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { EditSheetFrame } from '../EditSheetFrame';
import { SelectableCard } from '../../register/SelectableCard';
import {
  usePublicClientTypesList,
  useUpdateMyClientType,
} from '../../../hooks/queries';
import { resolveIcon } from '../../../lib/iconRegistry';
import { toastApiError, toastSuccess } from '../../../lib/toast';
import { Colors } from '../../../theme/colors';

interface Props {
  isOpen: boolean;
  initialClientTypeId: string | null;
  onClose: () => void;
}

export function ClientTypeSheet({ isOpen, initialClientTypeId, onClose }: Props) {
  const { t } = useTranslation('profile');
  const { data, isLoading, isError, refetch } = usePublicClientTypesList();
  const { mutateAsync, isPending } = useUpdateMyClientType();
  const [selectedId, setSelectedId] = useState<string | null>(initialClientTypeId);

  useEffect(() => {
    if (isOpen) setSelectedId(initialClientTypeId);
  }, [isOpen, initialClientTypeId]);

  const canSave = selectedId !== null && selectedId !== initialClientTypeId;

  const handleSave = async () => {
    if (!selectedId) return;
    try {
      await mutateAsync({ client_type_id: selectedId });
      toastSuccess(t('edit.clientType.successToast'));
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
      titleLeading={t('edit.clientType.titleLeading')}
      titleItalic={t('edit.clientType.titleItalic')}
      titleTrailing={t('edit.clientType.titleTrailing')}
      subtitle={t('edit.clientType.subtitle')}
      primaryLabel={t('edit.save')}
      onPrimary={handleSave}
      primaryDisabled={!canSave}
      primaryLoading={isPending}
      // Long list of cards — give it a fixed tall snap + allow scrolling.
      snapPoints={['78%', '95%']}
      scrollable
    >
      {isLoading ? (
        <View style={{ paddingVertical: 32, alignItems: 'center' }}>
          <ActivityIndicator color={Colors.brand.orange} />
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              color: Colors.brand.navyMuted,
              marginTop: 10,
            }}
          >
            {t('edit.clientType.loading')}
          </Text>
        </View>
      ) : isError || !data ? (
        <View style={{ paddingVertical: 32, alignItems: 'center' }}>
          <Text
            style={{
              fontFamily: 'Inter_500Medium',
              fontSize: 14,
              color: Colors.danger,
              textAlign: 'center',
              marginBottom: 12,
            }}
          >
            {t('edit.clientType.error')}
          </Text>
          <Text
            onPress={() => refetch()}
            style={{
              fontFamily: 'Inter_600SemiBold',
              fontSize: 14,
              color: Colors.brand.orange,
            }}
          >
            {t('errors.retry')}
          </Text>
        </View>
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {data.map((type) => {
            const Icon = resolveIcon(type.icon_name);
            return (
              <View key={type.id} style={{ width: '48%' }}>
                {createElement(SelectableCard, {
                  icon: Icon,
                  title: type.name,
                  description: type.description ?? '',
                  selected: selectedId === type.id,
                  onPress: () => setSelectedId(type.id),
                })}
              </View>
            );
          })}
        </View>
      )}
    </EditSheetFrame>
  );
}
