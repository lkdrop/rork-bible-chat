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
      <Stack.Screen name="anonymous" />
      <Stack.Screen name="online-chat" />
      <Stack.Screen name="new-post" options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="profile" />
      <Stack.Screen name="followers" />
      <Stack.Screen name="messages" />
      <Stack.Screen name="dm-chat" />
      <Stack.Screen name="new-message" />
      <Stack.Screen name="story-viewer" options={{ presentation: 'fullScreenModal' }} />
    </Stack>
  );
}
