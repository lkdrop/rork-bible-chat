export interface ThemeColors {
  background: string;
  backgroundSecondary: string;
  card: string;
  cardElevated: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  accent: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  border: string;
  borderLight: string;
  success: string;
  error: string;
  warning: string;
  overlay: string;
  inputBg: string;
  tabBar: string;
  tabBarBorder: string;
  streak: string;
  shadow: string;
}

export const LightColors: ThemeColors = {
  background: '#FBF8F1',
  backgroundSecondary: '#F3EDE0',
  card: '#FFFFFF',
  cardElevated: '#FFFFFF',
  primary: '#C5943A',
  primaryLight: '#F0E4CC',
  primaryDark: '#8B6914',
  accent: '#A67C2E',
  text: '#2C1810',
  textSecondary: '#6B5C4D',
  textMuted: '#9E8E7E',
  textInverse: '#FFFFFF',
  border: '#E8E2D5',
  borderLight: '#F0EBE0',
  success: '#34C759',
  error: '#FF3B30',
  warning: '#FF9500',
  overlay: 'rgba(0,0,0,0.4)',
  inputBg: '#F5F0E5',
  tabBar: '#FFFFFF',
  tabBarBorder: '#E8E2D5',
  streak: '#E8750A',
  shadow: 'rgba(0,0,0,0.08)',
};

export const DarkColors: ThemeColors = {
  background: '#0A0F1E',
  backgroundSecondary: '#111827',
  card: '#1A1F2E',
  cardElevated: '#1F2537',
  primary: '#C5943A',
  primaryLight: 'rgba(197, 148, 58, 0.15)',
  primaryDark: '#D4A84B',
  accent: '#D4A84B',
  text: '#F3F4F6',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  textInverse: '#0A0F1E',
  border: 'rgba(255, 255, 255, 0.08)',
  borderLight: 'rgba(255, 255, 255, 0.10)',
  success: '#34d399',
  error: '#fb7185',
  warning: '#fbbf24',
  overlay: 'rgba(0,0,0,0.6)',
  inputBg: '#1A1F2E',
  tabBar: 'rgba(10, 15, 30, 0.95)',
  tabBarBorder: 'rgba(255, 255, 255, 0.06)',
  streak: '#fbbf24',
  shadow: 'rgba(0,0,0,0.3)',
};

export const Colors = LightColors;
export default Colors;
