import { useEffect, useRef, useState } from 'react';
import { Platform, InteractionManager } from 'react-native';
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

    // ⏳ Defer until React Native finishes initial rendering (fixes TurboModule crash)
    const task = InteractionManager.runAfterInteractions(async () => {
      if (!Device.isDevice) return;

      const isNativeRuntime =
        Platform.OS !== 'web' && Constants.appOwnership !== 'expo';

      // 🔐 Ask notification permissions safely
      let finalStatus: Notifications.PermissionStatus =
        Notifications.PermissionStatus.UNDETERMINED;
      try {
        const { status: existingStatus } =
          await Notifications.getPermissionsAsync();
        finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
      } catch (e) {
        console.warn('push permissions failed:', e);
        finalStatus = 'denied' as Notifications.PermissionStatus;
      }
      if (finalStatus !== 'granted') return;

      // 📱 Android channel safety (guarded)
      if (Platform.OS === 'android') {
        try {
          await ensureAndroidChannel();
        } catch {}
      }

      // 🎯 Get native push token
      let token: string | null = null;
      if (isNativeRuntime) {
        try {
          const res = await Notifications.getDevicePushTokenAsync();
          token = res?.data ?? null;
        } catch (e: any) {
          console.warn('getDevicePushTokenAsync failed:', e?.message ?? e);
        }
      }

      if (!mounted) return;
      setDeviceToken(token);

      // 💾 Register token with backend
      if (userId && token) {
        const platform: PlatformType =
          Platform.OS === 'ios' ? 'ios' : 'android';
        try {
          await api.post('/api/devices/register', {
            userId,
            platform,
            token,
            appVersion: Constants.nativeAppVersion ?? '1.0.0',
          });
        } catch {
          /* silent fail */
        }
      }
    });

    // 🤙 Only add response listener if needed (PushQueryBridge already listens)
    try {
      responseListener.current =
        Notifications.addNotificationResponseReceivedListener(
          async (response) => {
            try {
              const payload = response.notification.request.content.data as any;
              const deepLink: string | undefined = payload?.deepLink;
              const notificationId: string | undefined =
                payload?.notificationId;

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
    } catch (e) {
      console.warn('response listener failed:', e);
    }

    return () => {
      mounted = false;
      task?.cancel?.();
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
        responseListener.current = null;
      }
    };
  }, [userId]);

  return { deviceToken };
}
