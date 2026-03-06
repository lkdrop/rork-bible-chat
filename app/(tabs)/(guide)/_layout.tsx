import { Stack } from 'expo-router';
import { Colors } from '@/constants/colors';

export default function GuideLayout() {
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
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen 
        name="quiz" 
        options={{ 
          title: 'Descubra Suas Orações',
          presentation: 'modal',
        }} 
      />
      <Stack.Screen 
        name="prayer/[id]" 
        options={{ 
          title: 'Oração da Madrugada',
        }} 
      />
    </Stack>
  );
}
