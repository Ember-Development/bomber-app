import { Resend } from 'resend';
import util from 'node:util';

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.EMAIL_FROM;

console.log('[email] boot', {
  hasApiKey: Boolean(apiKey),
  from,
});

const resend = new Resend(apiKey);

type SendArgs = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
};

export async function sendEmail({
  to,
  subject,
  html,
  text,
  replyTo,
}: SendArgs) {
  console.log('[email] sending', { to, subject, replyTo });

  const { data, error } = await resend.emails.send({
    from: from as string,
    to,
    subject,
    html,
    text,
    replyTo,
  });

  if (error) {
    // ⬇️ Print everything Resend gives us
    console.error(
      '[email] resend error (raw):',
      util.inspect(error, { depth: 5 })
    );
    // Some errors have details array—print it explicitly too
    if ((error as any)?.details)
      console.error(
        '[email] details:',
        JSON.stringify((error as any).details, null, 2)
      );
    throw error; // ⬅️ don't lose the original info
  }

  console.log('[email] sent ok', { id: data?.id });
  return data?.id;
}

export async function sendPasswordResetEmail(opts: {
  to: string;
  email: string;
  token: string;
}) {
  const web = `${process.env.RESET_LINK_BASE_WEB}?token=${encodeURIComponent(opts.token)}&email=${encodeURIComponent(opts.email)}`;
  const app = `${process.env.RESET_LINK_SCHEME}?token=${encodeURIComponent(opts.token)}&email=${encodeURIComponent(opts.email)}`;

  console.log('[email] reset links', { app, web });
  return sendEmail({
    to: opts.to,
    subject: 'Reset your Bomber password',
    html: `<p>Open app: <a href="${app}">${app}</a></p><p>Open web: <a href="${web}">${web}</a></p>`,
    text: `App: ${app}\nWeb: ${web}`,
  });
}
