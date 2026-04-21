import '../global.css';
import '../src/i18n';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  Fraunces_400Regular,
  Fraunces_600SemiBold,
  Fraunces_700Bold,
  Fraunces_400Regular_Italic,
  Fraunces_600SemiBold_Italic,
  Fraunces_700Bold_Italic,
} from '@expo-google-fonts/fraunces';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from '../src/contexts/AuthContext';

SplashScreen.preventAutoHideAsync();

// Apply Inter as the default font for every Text and TextInput in the app.
// React Native has no CSS font inheritance — each component must set fontFamily
// explicitly. defaultProps is the only clean way to set a global default without
// wrapping every component in a custom Text.
const interRegular = { fontFamily: 'Inter_400Regular' };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(Text as any).defaultProps = { ...((Text as any).defaultProps ?? {}), style: interRegular };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(TextInput as any).defaultProps = { ...((TextInput as any).defaultProps ?? {}), style: interRegular };

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000, // 2 min
      gcTime: 30 * 60 * 1000,   // 30 min
      retry: 1,
    },
  },
});

// Stable style object — defined once at module scope so GestureHandlerRootView
// never receives a new object reference on re-renders.
const rootStyle = StyleSheet.create({ flex: { flex: 1 } });

// Separate component so useSafeAreaInsets can be called inside SafeAreaProvider.
function ToastWithInsets() {
  const { top } = useSafeAreaInsets();
  return <Toast topOffset={top + 8} />;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Fraunces_400Regular,
    Fraunces_600SemiBold,
    Fraunces_700Bold,
    Fraunces_400Regular_Italic,
    Fraunces_600SemiBold_Italic,
    Fraunces_700Bold_Italic,
  });

  // ready = fonts loaded successfully OR font loading failed (fall back to system fonts)
  // Either way the splash must hide so the user can use the app.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      setReady(true);
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  // Safety net: hide splash after 4 s no matter what (handles edge cases in
  // new-arch dev builds where font callbacks may not fire).
  useEffect(() => {
    const timer = setTimeout(() => {
      setReady(true);
      SplashScreen.hideAsync().catch(() => {});
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={rootStyle.flex}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="onboarding" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(app)" />
              <Stack.Screen name="(client)" />
              <Stack.Screen name="flow-choice" options={{ presentation: 'modal' }} />
            </Stack>
            <StatusBar style="auto" />
            <ToastWithInsets />
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
