import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, SPACING, RADIUS } from '@/constants/theme';
import type { Achievement } from '@/types';
import type { ThemeColors } from '@/constants/colors';

interface BadgeCardProps {
  achievement: Achievement;
  colors: ThemeColors;
  unlocked?: boolean;
}

function BadgeCardComponent({ achievement, colors, unlocked = !!achievement.unlockedAt }: BadgeCardProps) {
  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.borderLight, opacity: unlocked ? 1 : 0.5 }]}>
      <Text style={styles.emoji}>{achievement.emoji}</Text>
      <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
        {achievement.title}
      </Text>
      <Text style={[styles.description, { color: colors.textMuted }]} numberOfLines={2}>
        {achievement.description}
      </Text>
      {unlocked && achievement.unlockedAt && (
        <Text style={styles.date}>
          {new Date(achievement.unlockedAt).toLocaleDateString('pt-BR')}
        </Text>
      )}
    </View>
  );
}

export const BadgeCard = React.memo(BadgeCardComponent);

const styles = StyleSheet.create({
  container: {
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    alignItems: 'center',
    gap: SPACING.xs,
    minWidth: 100,
  },
  emoji: {
    fontSize: 32,
    marginBottom: SPACING.xs,
  },
  title: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    textAlign: 'center',
  },
  description: {
    fontSize: FONT_SIZES.xs,
    textAlign: 'center',
    lineHeight: 16,
  },
  date: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gold,
    fontWeight: '600',
    marginTop: SPACING.xs,
  },
});
