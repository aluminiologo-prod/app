import React from 'react';
import { View, Text, useColorScheme } from 'react-native';
import { STATUS_COLORS, STATUS_COLORS_DARK } from '../../theme/colors';
import type { TransferStatus } from '../../types/transfer';

interface StatusChipProps {
  status: TransferStatus;
  label: string;
  size?: 'sm' | 'md';
}

export const StatusChip = React.memo(function StatusChip({ status, label, size = 'md' }: StatusChipProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const palette = isDark ? STATUS_COLORS_DARK : STATUS_COLORS;
  const { bg, text, border } = palette[status] ?? palette.DRAFT;

  return (
    <View
      style={{ backgroundColor: bg, borderColor: border }}
      className={`rounded-full border ${size === 'sm' ? 'px-2 py-0.5' : 'px-3 py-1'}`}
    >
      <Text
        style={{ color: text }}
        className={`font-semibold ${size === 'sm' ? 'text-xs' : 'text-xs'}`}
      >
        {label}
      </Text>
    </View>
  );
});
