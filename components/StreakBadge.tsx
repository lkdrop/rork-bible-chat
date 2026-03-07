import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { Flame } from 'lucide-react-native';
import { COLORS, FONT_SIZES, SPACING, RADIUS } from '@/constants/theme';

interface StreakBadgeProps {
  streak: number;
  color?: string;
}

function StreakBadgeComponent({ streak, color = COLORS.streak }: StreakBadgeProps) {
  const flameAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (streak <= 0) return;
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(flameAnim, { toValue: 1.2, duration: 700, useNativeDriver: true }),
        Animated.timing(flameAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [streak, flameAnim]);

  if (streak <= 0) return null;

  return (
    <View style={[styles.container, { backgroundColor: color + '15' }]}>
      <Animated.View style={{ transform: [{ scale: flameAnim }] }}>
        <Flame size={18} color={color} fill={color} />
      </Animated.View>
      <Text style={[styles.text, { color }]}>{streak}</Text>
    </View>
  );
}

export const StreakBadge = React.memo(StreakBadgeComponent);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: RADIUS.lg,
  },
  text: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
  },
});
