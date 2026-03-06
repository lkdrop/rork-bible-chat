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
  background: '#0D0D0D',
  backgroundSecondary: '#151515',
  card: '#1A1A1A',
  cardElevated: '#222222',
  primary: '#C9922A',
  primaryLight: '#3D3420',
  primaryDark: '#E8C564',
  accent: '#E0B854',
  text: '#F2F2F7',
  textSecondary: '#AEAEB2',
  textMuted: '#8E8E93',
  textInverse: '#1C1C1E',
  border: '#2A2A2A',
  borderLight: '#333333',
  success: '#30D158',
  error: '#FF453A',
  warning: '#FFD60A',
  overlay: 'rgba(0,0,0,0.6)',
  inputBg: '#2A2A2A',
  tabBar: '#1A1A1A',
  tabBarBorder: '#2A2A2A',
  streak: '#FF8C21',
  shadow: 'rgba(0,0,0,0.3)',
};

export const Colors = LightColors;
export default Colors;
