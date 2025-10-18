// features/notifications/foreground.ts
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export function configureForegroundHandling() {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  } catch (e) {
    console.log('setNotificationHandler failed:', e);
  }
}

export async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return;
  try {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
      showBadge: true,
      sound: 'default',
    });
  } catch (e) {
    console.log('ensureAndroidChannel error:', e);
  }
}
