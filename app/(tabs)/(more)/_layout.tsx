import { Stack } from 'expo-router';
import { Colors } from '@/constants/colors';

export default function MoreLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.primary.navy,
        },
        headerTintColor: Colors.text.light,
        headerTitleStyle: {
          fontWeight: '700',
        },
        contentStyle: { backgroundColor: Colors.background.cream },
      }}
    >
      <Stack.Screen name="more" options={{ headerShown: false }} />
      <Stack.Screen name="achievements" options={{ headerShown: true, title: 'Conquistas' }} />
      <Stack.Screen name="diary" options={{ headerShown: true, title: 'Diário de Oração' }} />
      <Stack.Screen name="timer" options={{ headerShown: true, title: 'Meditação' }} />
      <Stack.Screen name="game" options={{ headerShown: false }} />
      <Stack.Screen name="bible-quiz" options={{ headerShown: true, title: 'Quiz Bíblico' }} />
      <Stack.Screen name="devotional" options={{ headerShown: true, title: 'Devocionais' }} />
      <Stack.Screen name="challenges" options={{ headerShown: true, title: 'Desafios Diários' }} />
    </Stack>
  );
}
