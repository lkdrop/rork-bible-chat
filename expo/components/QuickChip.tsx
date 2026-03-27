import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FONT_SIZES, SPACING, RADIUS } from '@/constants/theme';
import type { ThemeColors } from '@/constants/colors';

interface QuickChipProps {
  emoji: string;
  label: string;
  onPress: () => void;
  colors: ThemeColors;
  accentColor?: string;
}

function QuickChipComponent({ emoji, label, onPress, colors, accentColor = '#C5943A' }: QuickChipProps) {
  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.card, borderColor: accentColor + '30' }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
    </TouchableOpacity>
  );
}

export const QuickChip = React.memo(QuickChipComponent);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm - 2,
    paddingHorizontal: SPACING.md - 2,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
  },
  emoji: {
    fontSize: FONT_SIZES.xl,
  },
  label: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
  },
});
