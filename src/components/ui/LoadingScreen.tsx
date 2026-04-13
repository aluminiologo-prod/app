import { View, ActivityIndicator } from 'react-native';
import { Colors } from '../../theme/colors';

export function LoadingScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-[#0F1117]">
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}
