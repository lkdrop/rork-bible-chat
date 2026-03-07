import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect, useCallback } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { View, Text, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BookOpen } from 'lucide-react-native';

import { AppProvider, useApp } from '@/contexts/AppContext';
import { ChatProvider } from '@/contexts/ChatContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';

void SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function AuthLoadingScreen() {
  return (
    <View style={loadingStyles.container}>
      <LinearGradient
        colors={['#C5943A', '#D4A84B', '#C5943A']}
        style={loadingStyles.iconBox}
      >
        <BookOpen size={36} color="#FFF" />
      </LinearGradient>
      <Text style={loadingStyles.title}>Devocio<Text style={loadingStyles.titleIA}>.IA</Text></Text>
      <ActivityIndicator color="#C5943A" size="small" style={loadingStyles.spinner} />
    </View>
  );
}

const loadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBF8F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBox: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#2C1810',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
  },
  titleIA: {
    color: '#C5943A',
    fontWeight: '800',
  },
  spinner: {
    marginTop: 8,
  },
});

function RootLayoutNav() {
  const { state, colors, setEmail } = useApp();
  const { isAuthenticated, isAuthReady, isSupabaseConfigured, user } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  // Hide native splash screen once auth is ready
  const hideSplash = useCallback(async () => {
    if (isAuthReady) {
      await SplashScreen.hideAsync();
    }
  }, [isAuthReady]);

  useEffect(() => {
    void hideSplash();
  }, [hideSplash]);

  // Sync email from AuthContext to AppContext (needed for admin detection)
  useEffect(() => {
    if (user?.email && user.email !== state.email) {
      setEmail(user.email);
    }
  }, [user?.email, state.email, setEmail]);

  useEffect(() => {
    if (!isAuthReady) return;
    const inAuthScreen = segments[0] === 'auth';
    const inLandingScreen = segments[0] === 'landing';

    if (!isAuthenticated && isSupabaseConfigured && !inAuthScreen && !inLandingScreen) {
      router.replace('/landing');
    }
  }, [isAuthenticated, isAuthReady, isSupabaseConfigured, segments, router]);

  // Show branded loading while checking auth (web fallback since SplashScreen is native-only)
  if (!isAuthReady) {
    return (
      <>
        <StatusBar style="dark" />
        <AuthLoadingScreen />
      </>
    );
  }

  return (
    <>
      <StatusBar style={state.theme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="onboarding"
          options={{ presentation: 'fullScreenModal', animation: 'fade' }}
        />
        <Stack.Screen
          name="paywall"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="landing"
          options={{ presentation: 'fullScreenModal', animation: 'fade' }}
        />
        <Stack.Screen
          name="auth"
          options={{ presentation: 'fullScreenModal', animation: 'fade' }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppProvider>
            <ChatProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <RootLayoutNav />
              </GestureHandlerRootView>
            </ChatProvider>
          </AppProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
