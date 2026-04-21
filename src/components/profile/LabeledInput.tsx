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
 * Stacked label + input, matches the visual rhythm of the register wizard.
 * When used inside a bottom sheet, pass `insideSheet` so the keyboard avoids
 * the sheet correctly (@gorhom's proxy input is required for that).
 */
export const LabeledInput = forwardRef<TextInput, Props>(function LabeledInput(
  { label, error, insideSheet, ...inputProps },
  ref,
) {
  const isDark = useColorScheme() === 'dark';
  const labelColor = isDark ? '#C7CBD4' : Colors.brand.navyMuted;
  const textColor = isDark ? '#ECEDEE' : Colors.brand.navy;
  const border = error
    ? Colors.danger
    : isDark
      ? '#30313A'
      : Colors.brand.creamSoft;
  const bg = isDark ? '#20222A' : '#FFFFFF';

  const Input = insideSheet ? BottomSheetTextInput : TextInput;

  return (
    <View style={{ marginBottom: 14 }}>
      <Text
        style={{
          fontFamily: 'Inter_600SemiBold',
          fontSize: 12,
          letterSpacing: 0.6,
          textTransform: 'uppercase',
          color: labelColor,
          marginBottom: 6,
        }}
      >
        {label}
      </Text>
      <Input
        ref={ref as never}
        placeholderTextColor={isDark ? '#71717A' : '#A1A1AA'}
        {...inputProps}
        style={{
          fontFamily: 'Inter_500Medium',
          fontSize: 15,
          color: textColor,
          backgroundColor: bg,
          paddingHorizontal: 14,
          paddingVertical: 13,
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
