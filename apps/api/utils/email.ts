import { Resend } from 'resend';
import util from 'node:util';

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.EMAIL_FROM;

console.log('[email] boot', { hasApiKey: Boolean(apiKey), from });

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
    console.error(
      '[email] resend error (raw):',
      util.inspect(error, { depth: 5 })
    );
    if ((error as any)?.details) {
      console.error(
        '[email] details:',
        JSON.stringify((error as any).details, null, 2)
      );
    }
    throw error;
  }

  console.log('[email] sent ok', { id: data?.id });
  return data?.id;
}

function obf(t: string) {
  return t.length < 12 ? t : `${t.slice(0, 6)}…${t.slice(-6)}`;
}

export async function sendPasswordResetEmail(opts: {
  to: string;
  email: string;
  token: string;
}) {
  const web = `${process.env.RESET_LINK_BASE_WEB}?token=${encodeURIComponent(
    opts.token
  )}&email=${encodeURIComponent(opts.email)}`;

  // Don’t log the full token or a clickable link
  console.log('[email] reset link (web only)', {
    urlPreview: `${process.env.RESET_LINK_BASE_WEB}?token=[token]&email=${opts.email}`,
    tokenPreview: obf(opts.token),
  });

  const html = `
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#0a0f1c;padding:24px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" role="presentation" style="background:#111a2e;border-radius:16px;padding:24px;color:#fff;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial">
        <tr><td align="center" style="font-size:20px;font-weight:700;padding-bottom:8px">Reset your Bomber password</td></tr>
        <tr><td align="center" style="font-size:14px;color:#bcd;line-height:1.5;padding-bottom:20px">
          Tap the button below to choose a new password.
        </td></tr>
        <tr><td align="center" style="padding-bottom:24px">
          <a href="${web}" style="display:inline-block;background:#6366f1;color:#fff;text-decoration:none;padding:12px 18px;border-radius:12px;font-weight:600">
            Reset Password
          </a>
        </td></tr>
        <tr><td style="font-size:12px;color:#9ab;line-height:1.5">
          If the button doesn’t work, copy and paste this link into your browser:<br/>
          <span style="word-break:break-all;color:#cde">${web}</span>
        </td></tr>
      </table>
    </td></tr>
  </table>`.trim();

  const text = `Reset your password: ${web}`;

  return sendEmail({
    to: opts.to,
    subject: 'Reset your Bomber password',
    html,
    text,
  });
}

export async function sendEmailVerificationEmail(opts: {
  to: string;
  email: string;
  token: string;
}) {
  // Use web URL that works in all browsers, then redirects to app
  const webLink = `${process.env.EMAIL_VERIFY_LINK_BASE_WEB}?token=${encodeURIComponent(opts.token)}&email=${encodeURIComponent(opts.email)}`;

  console.log('[email] verification link', {
    email: opts.email,
    tokenPreview: opts.token.slice(0, 10) + '...',
    urlPreview: `${process.env.EMAIL_VERIFY_LINK_BASE_WEB}?token=[token]&email=${opts.email}`,
  });

  const html = `
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#0a0f1c;padding:24px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" role="presentation" style="background:#111a2e;border-radius:16px;padding:24px;color:#fff;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial">
        <tr><td align="center" style="font-size:20px;font-weight:700;padding-bottom:8px">Verify your Bomber email</td></tr>
        <tr><td align="center" style="font-size:14px;color:#bcd;line-height:1.5;padding-bottom:20px">
          Tap the button below to verify your email address and enjoy all the features the Bomber App has to offer.
        </td></tr>
        <tr><td align="center" style="padding-bottom:24px">
          <a href="${webLink}" style="display:inline-block;background:#6366f1;color:#fff;text-decoration:none;padding:12px 18px;border-radius:12px;font-weight:600">
            Verify Email
          </a>
        </td></tr>
        <tr><td style="font-size:12px;color:#9ab;line-height:1.5">
          If the button doesn't work, copy and paste this link into your browser:<br/>
          <span style="word-break:break-all;color:#cde">${webLink}</span>
        </td></tr>
      </table>
    </td></tr>
  </table>`.trim();

  const text = `Verify your email: ${webLink}`;

  return sendEmail({
    to: opts.to,
    subject: 'Verify your Bomber email',
    html,
    text,
  });
}
