import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { ThemeProvider, DefaultTheme } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect } from 'react';

import { ChatProvider } from '@/contexts/ChatContext';
import { PrayerGuideProvider } from '@/contexts/PrayerGuideContext';

void SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

const LightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#faf8f5',
    card: '#1a365d',
    text: '#1a202c',
    border: '#e8c9a8',
    primary: '#d4a574',
  },
};

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#faf8f5' } }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    void SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={LightTheme}>
        <ChatProvider>
          <PrayerGuideProvider>
            <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#faf8f5' }}>
              <StatusBar style="light" />
              <RootLayoutNav />
            </GestureHandlerRootView>
          </PrayerGuideProvider>
        </ChatProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
