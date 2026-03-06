import { Stack } from 'expo-router';
import { useApp } from '@/contexts/AppContext';

export default function StudyLayout() {
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
      <Stack.Screen name="quiz" options={{ gestureEnabled: true, animation: 'slide_from_right' }} />
      <Stack.Screen name="characters" options={{ gestureEnabled: true, animation: 'slide_from_right' }} />
      <Stack.Screen name="character-detail" options={{ gestureEnabled: true, animation: 'slide_from_right' }} />
      <Stack.Screen name="search" options={{ gestureEnabled: true, animation: 'slide_from_right' }} />
      <Stack.Screen name="plan-detail" options={{ gestureEnabled: true, animation: 'slide_from_right' }} />
      <Stack.Screen name="marathon" options={{ gestureEnabled: true, animation: 'slide_from_right' }} />
      <Stack.Screen name="favorites" options={{ gestureEnabled: true, animation: 'slide_from_right' }} />
      <Stack.Screen name="journey-quiz" options={{ gestureEnabled: true, animation: 'slide_from_bottom' }} />
      <Stack.Screen name="journey" options={{ gestureEnabled: true, animation: 'slide_from_right' }} />
    </Stack>
  );
}
