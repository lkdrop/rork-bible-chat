import { Stack } from 'expo-router';
import { useApp } from '@/contexts/AppContext';

export default function HomeLayout() {
  const { colors } = useApp();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        gestureEnabled: true,
      }}
    />
  );
}
