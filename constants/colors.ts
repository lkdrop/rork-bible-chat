export const Colors = {
  primary: {
    navy: '#1a365d',
    navyLight: '#2c5282',
    navyDark: '#102a4c',
  },
  accent: {
    gold: '#d4a574',
    goldLight: '#e8c9a8',
    goldDark: '#b8935f',
  },
  background: {
    cream: '#faf8f5',
    creamDark: '#f5f0e8',
    white: '#ffffff',
  },
  text: {
    primary: '#1a202c',
    secondary: '#4a5568',
    muted: '#718096',
    light: '#ffffff',
  },
  message: {
    user: ['#3182ce', '#2b6cb0'] as const,
    assistant: '#ffffff',
    assistantBorder: '#e8c9a8',
  },
  shadow: {
    light: 'rgba(0, 0, 0, 0.06)',
    medium: 'rgba(0, 0, 0, 0.1)',
    dark: 'rgba(0, 0, 0, 0.15)',
  },
};

export default Colors;
