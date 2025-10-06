<<<<<<< HEAD
// app/_layout.tsx
=======
>>>>>>> events-tab
import React, { useEffect } from 'react';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from '@react-navigation/native';
<<<<<<< HEAD
import { Slot, usePathname, useRouter } from 'expo-router';
=======
import {
  Slot,
  usePathname,
  useRootNavigationState,
  useRouter,
} from 'expo-router';
>>>>>>> events-tab
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import 'react-native-reanimated';
import { ThemeProvider, useColorScheme } from '@/hooks/useColorScheme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
<<<<<<< HEAD
import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from '@tanstack/react-query';
import { UserProvider, useUserContext } from '@/context/useUserContext';
import BackgroundWrapper from '@/components/ui/organisms/backgroundWrapper';
import { View, ActivityIndicator } from 'react-native';

// ✅ Foreground handler + Android channel
import * as Notifications from 'expo-notifications';
import '../features/notifications/foreground';
import { ensureAndroidChannel } from '../features/notifications/foreground';
import { usePush } from '../features/notifications/usePush';

SplashScreen.preventAutoHideAsync();

function PushQueryBridge() {
  const qc = useQueryClient();
  useEffect(() => {
    const sub1 = Notifications.addNotificationReceivedListener(() => {
      qc.invalidateQueries({ queryKey: ['notifications', 'feed'] });
    });
    const sub2 = Notifications.addNotificationResponseReceivedListener(() => {
      qc.invalidateQueries({ queryKey: ['notifications', 'feed'] });
    });
    return () => {
      Notifications.removeNotificationSubscription(sub1);
      Notifications.removeNotificationSubscription(sub2);
    };
  }, [qc]);
  return null;
}

=======
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserProvider, useUserContext } from '@/context/useUserContext';
import BackgroundWrapper from '@/components/ui/organisms/backgroundWrapper';
import { View, ActivityIndicator } from 'react-native';

SplashScreen.preventAutoHideAsync();

>>>>>>> events-tab
function RootNavigator() {
  const { user, isLoading } = useUserContext();
  const router = useRouter();
  const pathname = usePathname();

<<<<<<< HEAD
  // Register push token + tap listener once the user is signed in
  usePush({ userId: user?.id });

  useEffect(() => {
    if (isLoading) return;

    if (__DEV__) {
      require('../utils/backhandler-logger');
    }

=======
  useEffect(() => {
    if (isLoading) return;

>>>>>>> events-tab
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
<<<<<<< HEAD
    if (inSignup || inOnboarding) return;
    if (atRoot || atAuth) safeReplace('/(tabs)');
  }, [isLoading, user, pathname]);
=======

    if (inSignup || inOnboarding) {
      return;
    }

    if (atRoot || atAuth) {
      safeReplace('/(tabs)');
    }
  }, [isLoading, user]);
>>>>>>> events-tab

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
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  // Android channel once at boot (safe no-op elsewhere)
  useEffect(() => {
    ensureAndroidChannel();
  }, []);

  if (!loaded) return null;

  return (
    <ThemeProvider>
      <NavigationThemeProvider value={TransparentTheme}>
        <QueryClientProvider client={queryClient}>
          <UserProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <View style={{ flex: 1 }}>
<<<<<<< HEAD
                <PushQueryBridge />
=======
>>>>>>> events-tab
                <RootNavigator />
              </View>
            </GestureHandlerRootView>
          </UserProvider>
        </QueryClientProvider>
      </NavigationThemeProvider>
    </ThemeProvider>
  );
}
