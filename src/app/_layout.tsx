import '@/global.css';

import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { colorScheme as nativewindColorScheme } from 'nativewind';
import { useEffect } from 'react';
import { Appearance, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { usePalette } from '@/constants/theme';
import { queryClient } from '@/query';
import { useSettingsHydrated, useTheme } from '@/settings';
import { appFonts } from '@/theme/fonts';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(appFonts);
  const settingsHydrated = useSettingsHydrated();
  const theme = useTheme();
  const palette = usePalette();

  // Drive NativeWind's color scheme from the stored preference. 'system' is
  // resolved to a concrete scheme here (NativeWind's class strategy doesn't
  // follow the OS on web on its own) and kept in sync via Appearance. Runs
  // pre-hydration too — harmless, re-runs once the stored value loads, still
  // behind the splash screen.
  useEffect(() => {
    if (theme !== 'system') {
      nativewindColorScheme.set(theme);
      return;
    }
    nativewindColorScheme.set(Appearance.getColorScheme() ?? 'light');
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      nativewindColorScheme.set(colorScheme ?? 'light');
    });
    return () => sub.remove();
  }, [theme]);

  const ready = (fontsLoaded || fontError) && settingsHydrated;

  useEffect(() => {
    if (ready) {
      void SplashScreen.hideAsync();
    }
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <View style={{ flex: 1, backgroundColor: palette.background }}>
            <StatusBar style="auto" />
            <Stack
              screenOptions={{
                headerStyle: { backgroundColor: palette.background },
                headerTintColor: palette.ink,
                headerTitleStyle: { fontFamily: 'Oswald_700Bold' },
                headerShadowVisible: false,
                // chevron only, no "Scores" text on the back button
                headerBackButtonDisplayMode: 'minimal',
                contentStyle: { backgroundColor: palette.background },
                // swipe-to-go-back from anywhere on the screen, not just the edge
                gestureEnabled: true,
                fullScreenGestureEnabled: true,
              }}
            >
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="game/[league]/[id]" options={{ title: 'Game' }} />
              {/* Settings screens live on the root stack so each gets the standard
                  native back button, same as the game-detail screen. */}
              <Stack.Screen name="settings/index" options={{ title: 'Settings' }} />
              <Stack.Screen name="settings/leagues" options={{ title: 'Leagues' }} />
              <Stack.Screen name="settings/about" options={{ title: 'About' }} />
            </Stack>
          </View>
        </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
