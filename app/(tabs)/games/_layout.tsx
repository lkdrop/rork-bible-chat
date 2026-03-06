import { Stack } from 'expo-router';
import { useApp } from '@/contexts/AppContext';

export default function GamesLayout() {
  const { colors } = useApp();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="snake" options={{ gestureEnabled: true, animation: 'slide_from_right' }} />
      <Stack.Screen name="bible-battle" options={{ gestureEnabled: true, animation: 'slide_from_bottom' }} />
      <Stack.Screen name="memory" options={{ gestureEnabled: true, animation: 'slide_from_right' }} />
    </Stack>
  );
}
