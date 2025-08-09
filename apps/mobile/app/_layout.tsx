import React, { useEffect } from 'react';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from '@react-navigation/native';
import {
  Slot,
  usePathname,
  useRootNavigationState,
  useRouter,
} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import 'react-native-reanimated';
import { ThemeProvider, useColorScheme } from '@/hooks/useColorScheme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserProvider, useUserContext } from '@/context/useUserContext';
import BackgroundWrapper from '@/components/ui/organisms/backgroundWrapper';
import { View, ActivityIndicator } from 'react-native';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { user, isLoading } = useUserContext();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    console.log('[NAV]', { isLoading, hasUser: !!user, pathname });
  }, [isLoading, user, pathname]);

  useEffect(() => {
    if (isLoading) return;

    const inSignup = pathname.startsWith('/signup');
    const inOnboarding =
      pathname.startsWith('/onboarding') || pathname.startsWith('/welcome');
    const atAuth =
      pathname.startsWith('/login') || pathname.startsWith('/signup');
    const atRoot = pathname === '/' || pathname === '';

    const safeReplace = (path: string) => {
      if (pathname !== path) router.replace(path);
    };

    if (!user) {
      if (!atAuth) safeReplace('/login');
      return;
    }

    if (inSignup || inOnboarding) {
      return;
    }

    if (atRoot || atAuth) {
      safeReplace('/(tabs)');
    }
  }, [isLoading, user]);

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

  return <Slot />;
}

export default function RootLayout() {
  const queryClient = new QueryClient();
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const navTheme = colorScheme.theme === 'dark' ? DarkTheme : DefaultTheme;
  const TransparentTheme = {
    ...navTheme,
    colors: { ...navTheme.colors, background: 'transparent' },
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
                <RootNavigator />
              </View>
            </GestureHandlerRootView>
          </UserProvider>
        </QueryClientProvider>
      </NavigationThemeProvider>
    </ThemeProvider>
  );
}
