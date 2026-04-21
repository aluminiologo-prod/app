import { Pressable, Text, View, useColorScheme } from 'react-native';
import { ChevronLeft, LogOut } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../theme/colors';

interface Props {
  title: string;
  onBack?: () => void;
  onLogout: () => void;
  logoutLabel: string;
  backLabel: string;
}

/**
 * Top bar for the profile screen: circular back button (left), serif title
 * (center), circular logout button (right). Back is only shown if
 * `onBack` is provided (CLIENT-only users don't have anywhere to go back to
 * from their home tab).
 */
export function ProfileHeader({
  title,
  onBack,
  onLogout,
  logoutLabel,
  backLabel,
}: Props) {
  const isDark = useColorScheme() === 'dark';
  const titleColor = isDark ? '#ECEDEE' : Colors.brand.navy;
  const buttonBg = isDark ? '#20222A' : Colors.brand.creamSoft;
  const buttonColor = isDark ? '#9BA1B0' : Colors.brand.navy;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 10,
      }}
    >
      {onBack ? (
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onBack();
          }}
          accessibilityRole="button"
          accessibilityLabel={backLabel}
          hitSlop={10}
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: buttonBg,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ChevronLeft size={20} color={buttonColor} strokeWidth={2} />
        </Pressable>
      ) : (
        <View style={{ width: 38, height: 38 }} />
      )}

      <Text
        style={{
          fontFamily: 'Fraunces_700Bold',
          fontSize: 18,
          color: titleColor,
        }}
        numberOfLines={1}
      >
        {title}
      </Text>

      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onLogout();
        }}
        accessibilityRole="button"
        accessibilityLabel={logoutLabel}
        hitSlop={10}
        style={{
          width: 38,
          height: 38,
          borderRadius: 19,
          backgroundColor: buttonBg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <LogOut size={18} color={buttonColor} strokeWidth={2} />
      </Pressable>
    </View>
  );
}
