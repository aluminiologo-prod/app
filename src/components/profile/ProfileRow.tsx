import { Pressable, Text, View, useColorScheme } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { Check, ChevronRight } from 'lucide-react-native';
import { Colors } from '../../theme/colors';

interface Props {
  icon: LucideIcon;
  label: string;
  value: string | null | undefined;
  emptyLabel: string;
  onPress: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  /** When set, renders a small green "verified" tag next to the label. */
  verified?: boolean;
  verifiedLabel?: string;
}

/**
 * One line inside a section card. Horizontal composition:
 *   [ soft-orange icon ]  [ LABEL ]    [ chevron ]
 *                         [ value ]
 *
 * Tappable — opens the matching edit sheet. When `value` is empty, renders
 * a muted "Add" affordance in the brand orange so the row always feels
 * actionable.
 */
export function ProfileRow({
  icon: Icon,
  label,
  value,
  emptyLabel,
  onPress,
  isFirst = false,
  isLast = false,
  verified = false,
  verifiedLabel,
}: Props) {
  const isDark = useColorScheme() === 'dark';
  const borderColor = isDark ? '#272831' : Colors.brand.creamSoft;
  const labelColor = isDark ? '#9BA1B0' : Colors.brand.navyMuted;
  const valueColor = isDark ? '#ECEDEE' : Colors.brand.navy;
  const iconBg = isDark ? '#20222A' : Colors.brand.orangeSoft;
  const chevronColor = isDark ? '#71717A' : Colors.brand.navyMuted;
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
      })}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          backgroundColor: iconBg,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 14,
        }}
      >
        <Icon size={18} color={Colors.brand.orange} strokeWidth={2} />
      </View>
      <View style={{ flex: 1, marginRight: 8 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 2,
          }}
        >
          <Text
            style={{
              fontFamily: 'Inter_500Medium',
              fontSize: 11,
              letterSpacing: 1,
              textTransform: 'uppercase',
              color: labelColor,
            }}
            numberOfLines={1}
          >
            {label}
          </Text>
          {verified ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 3,
                marginLeft: 8,
              }}
            >
              <Check size={11} color={Colors.success} strokeWidth={3} />
              <Text
                style={{
                  fontFamily: 'Inter_700Bold',
                  fontSize: 9.5,
                  letterSpacing: 0.6,
                  textTransform: 'uppercase',
                  color: Colors.success,
                }}
              >
                {verifiedLabel}
              </Text>
            </View>
          ) : null}
        </View>
        {hasValue ? (
          <Text
            style={{
              fontFamily: 'Inter_700Bold',
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
              fontFamily: 'Inter_600SemiBold',
              fontSize: 13,
              color: Colors.brand.orange,
            }}
          >
            {emptyLabel}
          </Text>
        )}
      </View>
      <ChevronRight size={18} color={chevronColor} />
    </Pressable>
  );
}
