import { Image, Pressable, View } from 'react-native';
import { type SharedValue } from 'react-native-reanimated';
import { X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../theme/colors';
import { OnboardingProgressBar } from './OnboardingProgressBar';

const LOGO_LIGHT = require('../../../assets/logo-light.png');
const LOGO_DARK = require('../../../assets/logo-dark.png');

interface OnboardingHeaderProps {
  variant: 'light' | 'dark';
  activeIndex: number;
  totalSlides: number;
  progress: SharedValue<number>;
  onClose: () => void;
}

export function OnboardingHeader({
  variant,
  activeIndex,
  totalSlides,
  progress,
  onClose,
}: OnboardingHeaderProps) {
  const isDark = variant === 'dark';
  const iconInk = isDark ? '#FFFFFF' : Colors.brand.navy;

  return (
    <View style={{ paddingTop: 4, paddingBottom: 14 }}>
      <OnboardingProgressBar
        activeIndex={activeIndex}
        totalSlides={totalSlides}
        progress={progress}
        variant={variant}
      />

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 20,
          minHeight: 44,
        }}
      >
        <Image
          source={isDark ? LOGO_DARK : LOGO_LIGHT}
          resizeMode="contain"
          style={{ width: 170, height: 40 }}
          accessibilityIgnoresInvertColors
        />

        <Pressable
          onPress={() => {
            Haptics.selectionAsync();
            onClose();
          }}
          accessibilityRole="button"
          accessibilityLabel="Close"
          hitSlop={12}
          style={({ pressed }) => ({
            width: 44,
            height: 44,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.5 : 0.75,
          })}
        >
          <X size={22} color={iconInk} strokeWidth={2} />
        </Pressable>
      </View>
    </View>
  );
}
