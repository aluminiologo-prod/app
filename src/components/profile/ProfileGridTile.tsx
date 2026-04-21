import { Pressable, Text, View, useColorScheme } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { Colors } from '../../theme/colors';

interface Props {
  icon: LucideIcon;
  label: string;
  badge?: string;
  onPress: () => void;
}

/**
 * One tile in the 2x2 "Aplicación" grid. Placeholder action — most of these
 * point at screens we haven't built, so they show the "coming soon" chip and
 * just no-op on press.
 */
export function ProfileGridTile({ icon: Icon, label, badge, onPress }: Props) {
  const isDark = useColorScheme() === 'dark';
  const bg = isDark ? '#18191F' : '#FFFFFF';
  const border = isDark ? '#272831' : Colors.brand.creamSoft;
  const textColor = isDark ? '#ECEDEE' : Colors.brand.navy;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => ({
        flex: 1,
        minHeight: 104,
        backgroundColor: bg,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: border,
        padding: 14,
        justifyContent: 'space-between',
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: Colors.brand.orangeSoft,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon size={18} color={Colors.brand.orange} strokeWidth={2} />
      </View>
      <View>
        <Text
          style={{
            fontFamily: 'Inter_600SemiBold',
            fontSize: 14,
            color: textColor,
          }}
          numberOfLines={1}
        >
          {label}
        </Text>
        {badge ? (
          <Text
            style={{
              fontFamily: 'Inter_500Medium',
              fontSize: 10,
              color: Colors.brand.orange,
              letterSpacing: 0.4,
              textTransform: 'uppercase',
              marginTop: 2,
            }}
          >
            {badge}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}
