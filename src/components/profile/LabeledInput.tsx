import { forwardRef } from 'react';
import { Text, TextInput, type TextInputProps, View, useColorScheme } from 'react-native';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { Colors } from '../../theme/colors';

interface Props extends Omit<TextInputProps, 'style'> {
  label: string;
  error?: string | null;
  /** Set to true when rendering inside a BottomSheet — uses BottomSheetTextInput. */
  insideSheet?: boolean;
}

/**
 * Stacked label + input, tuned for the cream-background edit sheets.
 * When used inside a bottom sheet, pass `insideSheet` so @gorhom's input
 * proxy keeps the keyboard-avoidance + interactive gestures working.
 */
export const LabeledInput = forwardRef<TextInput, Props>(function LabeledInput(
  { label, error, insideSheet, ...inputProps },
  ref,
) {
  const isDark = useColorScheme() === 'dark';
  const labelColor = isDark ? '#9BA1B0' : Colors.brand.navyMuted;
  const textColor = isDark ? '#ECEDEE' : Colors.brand.navy;
  const border = error
    ? Colors.danger
    : isDark
      ? '#30313A'
      : '#E2DAC9';
  const bg = isDark ? '#20222A' : '#FFFFFF';

  const Input = insideSheet ? BottomSheetTextInput : TextInput;

  return (
    <View style={{ marginBottom: 16 }}>
      <Text
        style={{
          fontFamily: 'Inter_700Bold',
          fontSize: 11,
          letterSpacing: 1.2,
          textTransform: 'uppercase',
          color: labelColor,
          marginBottom: 8,
        }}
      >
        {label}
      </Text>
      <Input
        ref={ref as never}
        placeholderTextColor={isDark ? '#71717A' : '#A89F8E'}
        {...inputProps}
        style={{
          fontFamily: 'Inter_500Medium',
          fontSize: 15,
          color: textColor,
          backgroundColor: bg,
          paddingHorizontal: 16,
          paddingVertical: 14,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: border,
        }}
      />
      {error ? (
        <Text
          style={{
            fontFamily: 'Inter_500Medium',
            fontSize: 12,
            color: Colors.danger,
            marginTop: 6,
          }}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
});
