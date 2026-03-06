import { Stack } from 'expo-router';

export default function ChatLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#faf8f5' },
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
}
