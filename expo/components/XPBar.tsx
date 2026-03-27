import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, SPACING, RADIUS } from '@/constants/theme';
import { useXP } from '@/hooks/useXP';

interface XPBarProps {
  showLabel?: boolean;
  height?: number;
}

function XPBarComponent({ showLabel = true, height = 6 }: XPBarProps) {
  const { xp, currentLevel, nextLevel, progress, xpToNextLevel } = useXP();

  return (
    <View style={styles.container}>
      {showLabel && (
        <View style={styles.labelRow}>
          <Text style={styles.levelText}>
            {currentLevel.emoji} {currentLevel.title}
          </Text>
          <Text style={styles.xpText}>
            {xp} XP {nextLevel ? `· ${xpToNextLevel} para ${nextLevel.title}` : '· Nível máximo!'}
          </Text>
        </View>
      )}
      <View style={[styles.track, { height }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${progress}%` as `${number}%`,
              height,
              backgroundColor: currentLevel.color || COLORS.gold,
            },
          ]}
        />
      </View>
    </View>
  );
}

export const XPBar = React.memo(XPBarComponent);

const styles = StyleSheet.create({
  container: {
    gap: SPACING.xs,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelText: {
    fontSize: FONT_SIZES.base,
    fontWeight: '700',
    color: COLORS.gold,
  },
  xpText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '500',
    color: '#8E8E93',
  },
  track: {
    backgroundColor: '#E8E2D5',
    borderRadius: RADIUS.xs,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: RADIUS.xs,
  },
});
