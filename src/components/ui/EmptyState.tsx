import { View, Text, useColorScheme } from 'react-native';
import { PackageOpen } from 'lucide-react-native';
import { Colors } from '../../theme/colors';

interface EmptyStateProps {
  title?: string;
  subtitle?: string;
}

export function EmptyState({ title = 'No results', subtitle }: EmptyStateProps) {
  const isDark = useColorScheme() === 'dark';

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80, paddingHorizontal: 24 }}>
      <View style={{
        width: 64, height: 64, borderRadius: 32,
        backgroundColor: isDark ? Colors.dark.content2 : Colors.light.content2,
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 16,
      }}>
        <PackageOpen size={28} color={Colors.secondaryDark} />
      </View>
      <Text style={{
        fontSize: 16, fontWeight: '600',
        color: isDark ? Colors.dark.foreground : Colors.light.foreground,
        textAlign: 'center', marginBottom: 4,
      }}>
        {title}
      </Text>
      {subtitle && (
        <Text style={{
          fontSize: 14,
          color: Colors.light.muted,
          textAlign: 'center',
        }}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}
