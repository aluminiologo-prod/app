import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

export default function TransfersScreen() {
  const { t } = useTranslation('common');
  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-[#0F1117]">
      <Text className="text-base text-[#71717A]">{t('comingSoon')}</Text>
    </View>
  );
}
