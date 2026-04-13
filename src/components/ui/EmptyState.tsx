import { View, Text } from 'react-native';
import { PackageOpen } from 'lucide-react-native';
import { Colors } from '../../theme/colors';

interface EmptyStateProps {
  title?: string;
  subtitle?: string;
}

export function EmptyState({ title = 'No results', subtitle }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center py-20 px-6">
      <View className="w-16 h-16 rounded-full bg-content2 dark:bg-[#1F2028] items-center justify-center mb-4">
        <PackageOpen size={28} color={Colors.secondaryDark} />
      </View>
      <Text className="text-base font-semibold text-foreground dark:text-[#ECEDEE] text-center mb-1">
        {title}
      </Text>
      {subtitle && (
        <Text className="text-sm text-[#71717A] text-center">{subtitle}</Text>
      )}
    </View>
  );
}
