import { Pressable, Text, View, useColorScheme } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { ChevronRight } from 'lucide-react-native';
import { Colors } from '../../theme/colors';

interface Props {
  icon: LucideIcon;
  label: string;
  value: string | null | undefined;
  emptyLabel: string;
  onPress: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

/**
 * Single row inside a profile section. Tappable — opens the matching edit
 * sheet. When `value` is null/empty, renders a muted "Add" tag instead of an
 * empty space so the user always sees an actionable affordance.
 */
export function ProfileRow({
  icon: Icon,
  label,
  value,
  emptyLabel,
  onPress,
  isFirst = false,
  isLast = false,
}: Props) {
  const isDark = useColorScheme() === 'dark';
  const borderColor = isDark ? '#272831' : Colors.brand.creamSoft;
  const labelColor = isDark ? '#C7CBD4' : Colors.brand.navyMuted;
  const valueColor = isDark ? '#ECEDEE' : Colors.brand.navy;
  const iconBg = isDark ? '#20222A' : Colors.brand.orangeSoft;
  const hasValue = !!(value && value.trim().length > 0);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${hasValue ? value : emptyLabel}`}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderTopWidth: isFirst ? 0 : 1,
        borderTopColor: borderColor,
        opacity: pressed ? 0.6 : 1,
        borderTopLeftRadius: isFirst ? 16 : 0,
        borderTopRightRadius: isFirst ? 16 : 0,
        borderBottomLeftRadius: isLast ? 16 : 0,
        borderBottomRightRadius: isLast ? 16 : 0,
      })}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: iconBg,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}
      >
        <Icon size={18} color={Colors.brand.orange} strokeWidth={2} />
      </View>
      <View style={{ flex: 1, marginRight: 8 }}>
        <Text
          style={{
            fontFamily: 'Inter_500Medium',
            fontSize: 12,
            color: labelColor,
            letterSpacing: 0.2,
            marginBottom: 2,
          }}
          numberOfLines={1}
        >
          {label}
        </Text>
        {hasValue ? (
          <Text
            style={{
              fontFamily: 'Inter_600SemiBold',
              fontSize: 15,
              color: valueColor,
            }}
            numberOfLines={1}
          >
            {value}
          </Text>
        ) : (
          <Text
            style={{
              fontFamily: 'Inter_500Medium',
              fontSize: 13,
              color: Colors.brand.orange,
            }}
          >
            {emptyLabel}
          </Text>
        )}
      </View>
      <ChevronRight size={18} color={isDark ? '#71717A' : Colors.brand.navyMuted} />
    </Pressable>
  );
}
