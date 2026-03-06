import { Stack } from 'expo-router';
import { useApp } from '@/contexts/AppContext';

export default function ToolsLayout() {
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
      <Stack.Screen name="journal" options={{ gestureEnabled: true, animation: 'slide_from_right' }} />
      <Stack.Screen name="prayer-wall" options={{ gestureEnabled: true, animation: 'slide_from_right' }} />
      <Stack.Screen name="goals" options={{ gestureEnabled: true, animation: 'slide_from_right' }} />
      <Stack.Screen name="sermon-prep" options={{ gestureEnabled: true, animation: 'slide_from_right' }} />
      <Stack.Screen name="acts-prayer" options={{ gestureEnabled: true, animation: 'slide_from_right' }} />
    </Stack>
  );
}
