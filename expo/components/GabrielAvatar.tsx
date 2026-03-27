import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { Flame } from 'lucide-react-native';
import { COLORS } from '@/constants/theme';

interface GabrielAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

const SIZES = {
  sm: { container: 24, icon: 12 },
  md: { container: 40, icon: 20 },
  lg: { container: 80, icon: 40 },
};

function GabrielAvatarComponent({ size = 'md', animated = true }: GabrielAvatarProps) {
  const glowAnim = useRef(new Animated.Value(0.6)).current;
  const dims = SIZES[size];

  useEffect(() => {
    if (!animated) return;
    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.6, duration: 1500, useNativeDriver: true }),
      ])
    );
    glow.start();
    return () => glow.stop();
  }, [animated, glowAnim]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: dims.container,
          height: dims.container,
          borderRadius: dims.container / 2,
          opacity: animated ? glowAnim : 1,
        },
        size === 'lg' && styles.containerLg,
      ]}
    >
      <Flame size={dims.icon} color={COLORS.gold} fill={COLORS.gold} />
    </Animated.View>
  );
}

export const GabrielAvatar = React.memo(GabrielAvatarComponent);

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.gold + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerLg: {
    borderWidth: 2,
    borderColor: COLORS.gold + '30',
  },
});
