import { sendAPNs } from './apns';
import { sendFCM } from './fcm';

export const PUSH_ENABLED = process.env.PUSH_ENABLED === 'true';

export async function sendToDevice(params: {
  platform: 'ios' | 'android';
  token: string;
  title: string;
  body: string;
  deepLink?: string;
  imageUrl?: string;
  notificationId: string;
  badge?: number;
}) {
  if (!PUSH_ENABLED) return; // no-op if disabled

  const data = {
    deepLink: params.deepLink ?? '',
    imageUrl: params.imageUrl ?? '',
    notificationId: params.notificationId,
  };

  if (params.platform === 'ios') {
    await sendAPNs({
      deviceToken: params.token,
      title: params.title,
      body: params.body,
      imageUrl: params.imageUrl,
      badge: params.badge,
      data,
    });
  } else {
    await sendFCM({
      token: params.token,
      title: params.title,
      body: params.body,
      imageUrl: params.imageUrl,
      data,
    });
  }
}
