import { google } from 'googleapis';

const {
  FIREBASE_PROJECT_ID,
  FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY_BASE64,
} = process.env;

async function getAccessToken() {
  if (!FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY_BASE64) {
    throw new Error('FCM env not configured');
  }
  const key = Buffer.from(FIREBASE_PRIVATE_KEY_BASE64, 'base64').toString(
    'utf8'
  );
  const jwt = new google.auth.JWT({
    email: FIREBASE_CLIENT_EMAIL,
    key,
    scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
  });
  const { access_token } = await jwt.authorize();
  return access_token!;
}

export async function sendFCM({
  token,
  title,
  body,
  imageUrl,
  data,
}: {
  token: string;
  title: string;
  body: string;
  imageUrl?: string;
  data?: Record<string, string>;
}) {
  const accessToken = await getAccessToken();
  const url = `https://fcm.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/messages:send`;
  const message = {
    message: {
      token,
      notification: { title, body },
      android: {
        priority: 'HIGH',
        notification: { image: imageUrl, channel_id: 'default' },
      },
      data: { ...(data ?? {}), imageUrl: imageUrl ?? '' },
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`FCM ${res.status}: ${err}`);
  }
}
