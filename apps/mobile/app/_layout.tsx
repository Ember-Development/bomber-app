// app/_layout.tsx
import React, { useEffect } from 'react';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from '@react-navigation/native';
import { Slot, usePathname, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import 'react-native-reanimated';
import { ThemeProvider, useColorScheme } from '@/hooks/useColorScheme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from '@tanstack/react-query';
import { UserProvider, useUserContext } from '@/context/useUserContext';
import BackgroundWrapper from '@/components/ui/organisms/backgroundWrapper';
import { View, ActivityIndicator, AppState } from 'react-native';
import { ToastProvider, useToast } from '@/context/ToastContext';

// ✅ Foreground handler + Android channel
import * as Notifications from 'expo-notifications';
import '../features/notifications/foreground';
import { ensureAndroidChannel } from '../features/notifications/foreground';
import { usePush } from '../features/notifications/usePush';
import UpdatePrompt from '@/components/ui/molecules/UpdatePrompt';

SplashScreen.preventAutoHideAsync();

function PushQueryBridge() {
  const qc = useQueryClient();
  const { showToast } = useToast();

  useEffect(() => {
    const sub1 = Notifications.addNotificationReceivedListener(
      (notification) => {
        // Invalidate queries as before
        qc.invalidateQueries({ queryKey: ['notifications', 'feed'] });

        // Show in-app toast if app is in foreground
        if (AppState.currentState === 'active') {
          const data = notification.request.content;
          showToast({
            title: data.title || '',
            body: data.body || '',
            imageUrl: data.data?.imageUrl,
            deepLink: data.data?.deepLink,
          });
        }
      }
    );

    const sub2 = Notifications.addNotificationResponseReceivedListener(() => {
      qc.invalidateQueries({ queryKey: ['notifications', 'feed'] });
    });

    return () => {
      Notifications.removeNotificationSubscription(sub1);
      Notifications.removeNotificationSubscription(sub2);
    };
  }, [qc, showToast]);

  return null;
}

function RootNavigator() {
  const { user, isLoading } = useUserContext();
  const router = useRouter();
  const pathname = usePathname();

  // Register push token + tap listener once the user is signed in
  usePush({ userId: user?.id });

  useEffect(() => {
    if (isLoading) return;

    if (__DEV__) {
      require('../utils/backhandler-logger');
    }

    const inSignup = pathname.startsWith('/signup');
    const inOnboarding =
      pathname.startsWith('/onboarding') || pathname.startsWith('/welcome');
    const atAuth =
      pathname.startsWith('/login') || pathname.startsWith('/signup');
    const atRoot = pathname === '/' || pathname === '';

    const safeReplace = (path: string) => {
      if (pathname !== path) router.replace(path as '/login');
    };

    if (!user) {
      if (!atAuth) safeReplace('/login');
      return;
    }
    if (inSignup || inOnboarding) return;
    if (atRoot || atAuth) safeReplace('/(tabs)');
  }, [isLoading, user, pathname]);

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
            <ToastProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <View style={{ flex: 1 }}>
                  <PushQueryBridge />
                  <RootNavigator />
                  <UpdatePrompt />
                </View>
              </GestureHandlerRootView>
            </ToastProvider>
          </UserProvider>
        </QueryClientProvider>
      </NavigationThemeProvider>
    </ThemeProvider>
  );
}
