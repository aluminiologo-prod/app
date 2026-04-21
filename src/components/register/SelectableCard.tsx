import { useEffect, type ComponentType } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  Easing,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../theme/colors';

interface SelectableCardProps {
  icon: ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  title: string;
  description: string;
  selected: boolean;
  onPress: () => void;
}

/**
 * 2x2-grid card for the "¿Qué mejor te describe?" step. Selected state
 * highlights the card with an orange border, colored icon badge, and a
 * check-mark in the top-right corner that zooms in with a spring curve.
 */
export function SelectableCard({
  icon: Icon,
  title,
  description,
  selected,
  onPress,
}: SelectableCardProps) {
  const scale = useSharedValue(1);
  const borderGlow = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    borderGlow.value = withTiming(selected ? 1 : 0, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });
  }, [selected, borderGlow]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowOpacity: 0.05 + borderGlow.value * 0.14,
    shadowRadius: 8 + borderGlow.value * 10,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.975, { damping: 18, stiffness: 260 });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 18, stiffness: 260 });
  };

  return (
    <Animated.View
      style={[
        {
          flex: 1,
          shadowColor: Colors.brand.orange,
          shadowOffset: { width: 0, height: 6 },
          borderRadius: 18,
        },
        containerStyle,
      ]}
    >
      <Pressable
        onPress={() => {
          Haptics.selectionAsync();
          onPress();
        }}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="radio"
        accessibilityState={{ selected }}
        accessibilityLabel={title}
        accessibilityHint={description}
        style={{
          borderRadius: 18,
          borderWidth: 2,
          borderColor: selected ? Colors.brand.orange : Colors.brand.creamSoft,
          backgroundColor: '#FFFFFF',
          paddingVertical: 16,
          paddingHorizontal: 14,
          minHeight: 130,
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: selected ? Colors.brand.orange : Colors.brand.orangeSoft,
            marginBottom: 12,
          }}
        >
          <Icon
            size={20}
            color={selected ? '#FFFFFF' : Colors.brand.orange}
            strokeWidth={2.2}
          />
        </View>
        <Text
          style={{
            fontFamily: 'Inter_700Bold',
            fontSize: 15,
            color: Colors.brand.navy,
            marginBottom: 4,
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 12,
            color: Colors.brand.navyMuted,
            lineHeight: 16,
          }}
        >
          {description}
        </Text>

        {selected ? (
          <Animated.View
            entering={ZoomIn.springify().damping(12).stiffness(160)}
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              width: 22,
              height: 22,
              borderRadius: 11,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: Colors.brand.orange,
            }}
          >
            <Check size={14} color="#FFFFFF" strokeWidth={3} />
          </Animated.View>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}
