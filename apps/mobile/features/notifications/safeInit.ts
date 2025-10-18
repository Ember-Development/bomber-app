// features/notifications/safeInit.ts
import { InteractionManager, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

export async function initNotificationsSafe(onActivity: () => void) {
  return new Promise<{
    rcv?: { remove: () => void };
    resp?: { remove: () => void };
  }>((resolve) => {
    InteractionManager.runAfterInteractions(async () => {
      const out: any = {};
      try {
        if (Platform.OS === 'ios') {
          await Notifications.getPermissionsAsync().catch(() => {});
        }
        out.rcv = Notifications.addNotificationReceivedListener(onActivity);
        out.resp =
          Notifications.addNotificationResponseReceivedListener(onActivity);
      } catch (e) {
        console.log('initNotificationsSafe error:', e);
      }
      resolve(out);
    });
  });
}
