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
  text: '#1C1C1E',
  textSecondary: '#5A5A5E',
  textMuted: '#8E8E93',
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
  background: '#0f0a1a',
  backgroundSecondary: '#1a1128',
  card: 'rgba(255, 255, 255, 0.05)',
  cardElevated: 'rgba(255, 255, 255, 0.08)',
  primary: '#8b5cf6',
  primaryLight: 'rgba(139, 92, 246, 0.15)',
  primaryDark: '#c4b5fd',
  accent: '#a78bfa',
  text: '#f4f4f5',
  textSecondary: '#a1a1aa',
  textMuted: '#71717a',
  textInverse: '#0f0a1a',
  border: 'rgba(255, 255, 255, 0.08)',
  borderLight: 'rgba(255, 255, 255, 0.12)',
  success: '#34d399',
  error: '#fb7185',
  warning: '#fbbf24',
  overlay: 'rgba(0,0,0,0.6)',
  inputBg: 'rgba(255, 255, 255, 0.08)',
  tabBar: 'rgba(15, 10, 26, 0.85)',
  tabBarBorder: 'rgba(255, 255, 255, 0.08)',
  streak: '#fbbf24',
  shadow: 'rgba(0,0,0,0.3)',
};

export const Colors = LightColors;
export default Colors;
