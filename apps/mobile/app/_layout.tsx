// app/_layout.tsx
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { ThemeProvider, useColorScheme } from '@/hooks/useColorScheme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserProvider, useUserContext } from '@/context/useUserContext';
import BackgroundWrapper from '@/components/ui/organisms/backgroundWrapper';
import { View, ActivityIndicator } from 'react-native';

SplashScreen.preventAutoHideAsync();

function InnerLayout() {
  const { user, isLoading } = useUserContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      // Delay navigation to login until the stack is rendered
      requestAnimationFrame(() => {
        router.replace('/login');
      });
    }
  }, [user, isLoading]);

  console.log('[LAYOUT] isLoading:', isLoading);
  console.log('[LAYOUT] user:', user);

  if (isLoading) {
    return (
      <BackgroundWrapper>
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <ActivityIndicator size="large" />
        </View>
      </BackgroundWrapper>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="login" />
      <Stack.Screen name="teams" />
      <Stack.Screen name="side" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  const queryClient = new QueryClient();
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const theme = colorScheme.theme === 'dark' ? DarkTheme : DefaultTheme;
  const TransparentTheme = {
    ...theme,
    colors: { ...theme.colors, background: 'transparent' },
  };

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <ThemeProvider>
      <NavigationThemeProvider value={TransparentTheme}>
        <QueryClientProvider client={queryClient}>
          <UserProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <View style={{ flex: 1 }}>
                <InnerLayout />
              </View>
            </GestureHandlerRootView>
          </UserProvider>
        </QueryClientProvider>
      </NavigationThemeProvider>
    </ThemeProvider>
  );
}
