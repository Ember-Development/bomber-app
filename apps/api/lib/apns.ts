// apns.ts (drop-in improvements)
import http2 from 'http2';
import jwt from 'jsonwebtoken';

const {
  APNS_TEAM_ID,
  APNS_KEY_ID,
  APNS_BUNDLE_ID,
  APNS_P8_BASE64,
  APNS_SANDBOX = 'true',
} = process.env;

function buildApnsJwt() {
  if (!APNS_TEAM_ID || !APNS_KEY_ID || !APNS_P8_BASE64) {
    throw new Error('APNs env not configured');
  }
  const keyPem = Buffer.from(APNS_P8_BASE64, 'base64').toString('utf8'); // includes BEGIN/END lines
  return jwt.sign(
    { iss: APNS_TEAM_ID, iat: Math.floor(Date.now() / 1000) },
    keyPem,
    { algorithm: 'ES256', header: { alg: 'ES256', kid: APNS_KEY_ID } }
  );
}

export async function sendAPNs({
  deviceToken,
  title,
  body,
  imageUrl,
  data,
  badge,
}: {
  deviceToken: string;
  title: string;
  body: string;
  imageUrl?: string;
  data?: Record<string, string>;
  badge?: number;
}) {
  const production = APNS_SANDBOX !== 'true';
  const host = production ? 'api.push.apple.com' : 'api.sandbox.push.apple.com';

  console.log(`[APNs] Sending notification:`, {
    deviceToken: deviceToken.substring(0, 10) + '...',
    title,
    production,
    host,
    bundleId: APNS_BUNDLE_ID,
  });

  const client = http2.connect(`https://${host}`);
  const token = buildApnsJwt();

  const headers: http2.OutgoingHttpHeaders = {
    ':method': 'POST',
    ':path': `/3/device/${deviceToken}`,
    authorization: `bearer ${token}`,
    'apns-topic': APNS_BUNDLE_ID!, // must match exactly your bundle id
    'apns-push-type': 'alert', // required since iOS 13
    'apns-priority': '10',
  };

  const payload = JSON.stringify({
    aps: {
      alert: { title, body },
      sound: 'default',
      'mutable-content': imageUrl ? 1 : undefined, // Enable notification attachments (for images)
      badge: typeof badge === 'number' ? badge : undefined,
    },
    ...(data ?? {}),
  });

  await new Promise<void>((resolve, reject) => {
    const req = client.request(headers);
    let resp = '';
    let status: number | undefined;

    req.on('response', (h) => {
      status = Number(h[':status']);
    });

    req.setEncoding('utf8');
    req.on('data', (c) => (resp += c));
    req.on('end', () => {
      client.close();
      if (status && status >= 400) {
        let reason = resp;
        try {
          const j = JSON.parse(resp);
          if (j.reason) reason = j.reason;
        } catch {}
        console.error(`[APNs] ❌ Failed to send notification:`, {
          status,
          reason,
          production,
          deviceToken: deviceToken.substring(0, 10) + '...',
        });
        return reject(
          new Error(
            `APNs ${production ? 'prod' : 'sandbox'} ${status}: ${reason}`
          )
        );
      }
      console.log(
        `[APNs] ✅ Successfully sent notification to ${deviceToken.substring(0, 10)}...`
      );
      resolve();
    });
    req.on('error', (e) => {
      client.close();
      reject(e);
    });
    req.write(payload);
    req.end();
  });
}
