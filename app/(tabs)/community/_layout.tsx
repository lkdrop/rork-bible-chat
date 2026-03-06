import { Stack } from 'expo-router';
import { useApp } from '@/contexts/AppContext';

export default function CommunityLayout() {
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
    </Stack>
  );
}
