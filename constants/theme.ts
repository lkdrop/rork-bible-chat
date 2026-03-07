// ═══════════════════════════════════════════
// TEMA CENTRALIZADO — Bíblia IA
// ═══════════════════════════════════════════

export const COLORS = {
  // Gold/Amber (identidade visual principal)
  gold: '#C5943A',
  goldLight: '#E8C876',
  goldDark: '#8B6914',
  goldMuted: '#D4A84B',

  // Fundos
  cream: '#FBF8F1',
  creamDark: '#F3EDE0',
  dark: '#0A0F1E',
  dark2: '#111827',
  dark3: 'rgba(255, 255, 255, 0.05)',
  dark4: 'rgba(255, 255, 255, 0.08)',

  // Accent
  cyan: '#7DF9FF',
  orange: '#FF6B35',
  streak: '#fbbf24',
  streakLight: '#fbbf24',

  // Feedback
  success: '#22C55E',
  successLight: '#34C759',
  successDark: '#30D158',
  danger: '#EF4444',
  dangerLight: '#FF3B30',
  dangerDark: '#FF453A',
  warning: '#FF9500',
  warningDark: '#FFD60A',

  // Modos do chat
  modeGeral: '#C5943A',
  modeEmocao: '#06B6D4',
  modeTeologia: '#B8862D',
  modeEstudo: '#3B82F6',
  modeSermao: '#10B981',
  modeDevocional: '#D4A84B',

  // Categorias
  study: '#10B981',
  tools: '#C5943A',
  create: '#F59E0B',
  games: '#EF4444',
  community: '#06B6D4',

  // Neutros
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

export const FONTS = {
  display: 'Cinzel',
  body: 'Lora',
  mono: 'Courier New',
  // Pesos (React Native fontWeight)
  light: '300' as const,
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
} as const;

export const RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
} as const;

export const FONT_SIZES = {
  xs: 11,
  sm: 12,
  md: 13,
  base: 14,
  lg: 15,
  xl: 16,
  '2xl': 17,
  '3xl': 18,
  '4xl': 22,
  '5xl': 24,
  '6xl': 28,
} as const;

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
} as const;

// Limites do plano gratuito
export const FREE_LIMITS = {
  DAILY_MESSAGES: 5,
  DAILY_CREATES: 2,
  DAILY_PROPHETIC: 1,
} as const;
