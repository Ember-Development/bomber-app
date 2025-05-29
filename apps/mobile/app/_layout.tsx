import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { ThemeProvider, useColorScheme } from '@/hooks/useColorScheme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserProvider } from '@/context/useUserContext';
import BackgroundWrapper from '@/components/ui/organisms/backgroundWrapper';
import { View } from 'react-native';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const queryClient = new QueryClient();
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const TransparentTheme = {
    ...(colorScheme.theme === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(colorScheme.theme === 'dark'
        ? DarkTheme.colors
        : DefaultTheme.colors),
      background: 'transparent',
    },
  };

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <ThemeProvider>
      <NavigationThemeProvider value={TransparentTheme}>
        <QueryClientProvider client={queryClient}>
          <UserProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <View style={{ flex: 1 }}>
                <Stack>
                  <Stack.Screen
                    name="(tabs)"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen name="teams" options={{ headerShown: false }} />
                  <Stack.Screen name="+not-found" />
                </Stack>
              </View>
            </GestureHandlerRootView>
          </UserProvider>
        </QueryClientProvider>
      </NavigationThemeProvider>
    </ThemeProvider>
  );
}
