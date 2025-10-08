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
  const key = Buffer.from(APNS_P8_BASE64, 'base64').toString('utf8');
  return jwt.sign(
    { iss: APNS_TEAM_ID, iat: Math.floor(Date.now() / 1000) },
    key,
    { algorithm: 'ES256', header: { alg: 'ES256', kid: APNS_KEY_ID } }
  );
}

export async function sendAPNs({
  deviceToken,
  title,
  body,
  data,
}: {
  deviceToken: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}) {
  const host =
    APNS_SANDBOX === 'true'
      ? 'api.sandbox.push.apple.com'
      : 'api.push.apple.com';
  const client = http2.connect(`https://${host}`);
  const token = buildApnsJwt();

  const headers: http2.OutgoingHttpHeaders = {
    ':method': 'POST',
    ':path': `/3/device/${deviceToken}`,
    authorization: `bearer ${token}`,
    'apns-topic': APNS_BUNDLE_ID!,
    'apns-push-type': 'alert',
    'apns-priority': '10',
  };

  const payload = JSON.stringify({
    aps: { alert: { title, body }, sound: 'default' },
    ...(data ?? {}),
  });

  return await new Promise<void>((resolve, reject) => {
    const req = client.request(headers);
    let resp = '';
    req.setEncoding('utf8');
    req.on('data', (c) => (resp += c));
    req.on('end', () => {
      client.close();
      if (resp) {
        try {
          const j = JSON.parse(resp);
          if (j.reason) return reject(new Error(`APNs: ${j.reason}`));
        } catch {}
      }
      resolve();
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}
