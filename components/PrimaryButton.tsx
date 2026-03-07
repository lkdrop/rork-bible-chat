import React from 'react';
import { Text, TouchableOpacity, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONT_SIZES, SPACING, RADIUS } from '@/constants/theme';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'gold' | 'outline' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  style?: ViewStyle;
}

function PrimaryButtonComponent({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'gold',
  size = 'md',
  icon,
  style,
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;
  const sizeStyle = SIZE_STYLES[size];

  if (variant === 'gold') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.85}
        style={[styles.wrapper, isDisabled && styles.disabled, style]}
      >
        <LinearGradient
          colors={['#C5943A', '#8B6914']}
          style={[styles.gradient, sizeStyle]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <>
              {icon}
              <Text style={[styles.textGold, FONT_SIZE_MAP[size]]}>{title}</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'outline') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.7}
        style={[styles.outline, sizeStyle, isDisabled && styles.disabled, style]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={COLORS.gold} />
        ) : (
          <>
            {icon}
            <Text style={[styles.textOutline, FONT_SIZE_MAP[size]]}>{title}</Text>
          </>
        )}
      </TouchableOpacity>
    );
  }

  // dark variant
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
      style={[styles.dark, sizeStyle, isDisabled && styles.disabled, style]}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#FFF" />
      ) : (
        <>
          {icon}
          <Text style={[styles.textDark, FONT_SIZE_MAP[size]]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

export const PrimaryButton = React.memo(PrimaryButtonComponent);

const SIZE_STYLES: Record<string, ViewStyle> = {
  sm: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
  md: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md - 4 },
  lg: { paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md },
};

const FONT_SIZE_MAP: Record<string, { fontSize: number }> = {
  sm: { fontSize: FONT_SIZES.md },
  md: { fontSize: FONT_SIZES.lg },
  lg: { fontSize: FONT_SIZES.xl },
};

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  outline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.gold,
  },
  dark: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    borderRadius: RADIUS.md,
    backgroundColor: '#1a1a2e',
  },
  textGold: {
    color: '#FFF',
    fontWeight: '700',
  },
  textOutline: {
    color: COLORS.gold,
    fontWeight: '700',
  },
  textDark: {
    color: '#FFF',
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.5,
  },
});
