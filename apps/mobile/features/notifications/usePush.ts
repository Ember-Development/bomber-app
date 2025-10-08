import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';
import { api } from '@/api/api';
import { ensureAndroidChannel } from './foreground';

type PlatformType = 'ios' | 'android';

export function usePush(opts: { userId?: string | null }) {
  const { userId } = opts;
  const [deviceToken, setDeviceToken] = useState<string | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      if (!Device.isDevice) return;

      // ❗ Only attempt native token on standalone/dev builds, not Expo Go or web
      const isNativeRuntime =
        Platform.OS !== 'web' && Constants.appOwnership !== 'expo';

      // permissions first (safe on all)
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') return;

      if (Platform.OS === 'android') {
        await ensureAndroidChannel();
      }

      let token: string | null = null;
      if (isNativeRuntime) {
        try {
          const res = await Notifications.getDevicePushTokenAsync();
          token = res?.data ?? null;
        } catch (e: any) {
          console.warn('getDevicePushTokenAsync failed:', e?.message ?? e);
        }
      } else {
        // Skip in Expo Go / web to avoid "ExpoPushTokenManager" error
        token = null;
      }

      if (!mounted) return;
      setDeviceToken(token);

      if (userId && token) {
        const platform: PlatformType =
          Platform.OS === 'ios' ? 'ios' : 'android';
        try {
          await api.post('/api/devices/register', {
            userId,
            platform,
            token,
            appVersion: '1.0.0',
          });
        } catch {
          /* noop */
        }
      }
    })();

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(
        async (response) => {
          try {
            const payload = response.notification.request.content.data as any;
            const deepLink: string | undefined = payload?.deepLink;
            const notificationId: string | undefined = payload?.notificationId;

            if (deepLink) {
              Linking.openURL(deepLink).catch(() => {});
            }
            if (notificationId) {
              await api
                .post('/api/notifications/receipt/open', { notificationId })
                .catch(() => {});
            }
          } catch {}
        }
      );

    return () => {
      mounted = false;
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
        responseListener.current = null;
      }
    };
  }, [userId]);

  return { deviceToken };
}
