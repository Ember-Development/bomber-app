import { sendEmail } from '../utils/email';

type ContactSubmission = {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
};

export async function sendContactEmail(data: ContactSubmission) {
  // Create HTML email for Bo
  const html = `
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#0a0f1c;padding:24px;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial">
    <tr><td align="center">
      <table width="700" cellpadding="0" cellspacing="0" role="presentation" style="background:#111a2e;border-radius:16px;padding:32px;color:#fff">
        
        <!-- Header -->
        <tr><td align="center" style="padding-bottom:24px">
          <div style="font-size:28px;font-weight:800;background:linear-gradient(135deg, #57a4ff 0%, #6bb0ff 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">
            NEW CONTACT FORM SUBMISSION
          </div>
          <div style="font-size:14px;color:#9ab;margin-top:8px;font-weight:600;text-transform:uppercase;letter-spacing:1px">
            📧 Website Contact Form
          </div>
        </td></tr>

        <!-- Contact Information Card -->
        <tr><td style="padding-bottom:20px">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#1a2438;border-radius:12px;padding:20px;border:1px solid #57a4ff33">
            <tr><td style="font-size:12px;font-weight:700;color:#57a4ff;text-transform:uppercase;letter-spacing:1.5px;padding-bottom:12px">
              📋 Contact Information
            </td></tr>
            <tr><td>
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td width="50%" style="padding:8px 0">
                    <div style="color:#9ab;font-size:12px;margin-bottom:4px">Name</div>
                    <div style="color:#fff;font-size:15px;font-weight:600">${data.name}</div>
                  </td>
                  <td width="50%" style="padding:8px 0">
                    <div style="color:#9ab;font-size:12px;margin-bottom:4px">Email</div>
                    <div style="color:#57a4ff;font-size:14px">
                      <a href="mailto:${data.email}" style="color:#57a4ff;text-decoration:none">${data.email}</a>
                    </div>
                  </td>
                </tr>
                ${
                  data.phone
                    ? `
                <tr>
                  <td width="50%" style="padding:8px 0">
                    <div style="color:#9ab;font-size:12px;margin-bottom:4px">Phone</div>
                    <div style="color:#fff;font-size:14px">
                      <a href="tel:${data.phone}" style="color:#fff;text-decoration:none">${data.phone}</a>
                    </div>
                  </td>
                  <td width="50%" style="padding:8px 0"></td>
                </tr>
                `
                    : ''
                }
              </table>
            </td></tr>
          </table>
        </td></tr>

        <!-- Subject Card -->
        <tr><td style="padding-bottom:20px">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#1a2438;border-radius:12px;padding:20px;border:1px solid #57a4ff33">
            <tr><td style="font-size:12px;font-weight:700;color:#57a4ff;text-transform:uppercase;letter-spacing:1.5px;padding-bottom:12px">
              💬 Subject
            </td></tr>
            <tr><td>
              <div style="color:#fff;font-size:16px;font-weight:600">${data.subject}</div>
            </td></tr>
          </table>
        </td></tr>

        <!-- Message Card -->
        <tr><td style="padding-bottom:20px">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#1a2438;border-radius:12px;padding:20px;border:1px solid #57a4ff33">
            <tr><td style="font-size:12px;font-weight:700;color:#57a4ff;text-transform:uppercase;letter-spacing:1.5px;padding-bottom:12px">
              📝 Message
            </td></tr>
            <tr><td>
              <div style="color:#cde;font-size:14px;line-height:1.6;background:#0f1824;padding:16px;border-radius:8px;border-left:3px solid #57a4ff">
                ${data.message.replace(/\n/g, '<br/>')}
              </div>
            </td></tr>
          </table>
        </td></tr>

        <!-- Footer -->
        <tr><td align="center" style="padding-top:12px">
          <div style="font-size:12px;color:#9ab;line-height:1.6">
            This message was received from the Bombers Fastpitch website contact form.<br/>
            <span style="color:#7ab">Submitted on ${new Date().toLocaleString(
              'en-US',
              {
                timeZone: 'America/Chicago',
                dateStyle: 'full',
                timeStyle: 'short',
              }
            )}</span>
          </div>
        </td></tr>

      </table>
    </td></tr>
  </table>`.trim();

  // Create plain text version
  const text = `
NEW CONTACT FORM SUBMISSION

CONTACT INFORMATION
-------------------
Name: ${data.name}
Email: ${data.email}
${data.phone ? `Phone: ${data.phone}` : ''}

SUBJECT
-------
${data.subject}

MESSAGE
-------
${data.message}

Submitted on ${new Date().toLocaleString('en-US', {
    timeZone: 'America/Chicago',
    dateStyle: 'full',
    timeStyle: 'short',
  })}
`.trim();

  // Send email to Bo
  await sendEmail({
    to: 'bo@bombersfastpitch.net',
    subject: `📧 Contact Form: ${data.subject}`,
    html,
    text,
    replyTo: data.email,
  });

  // Send confirmation email to sender
  const confirmationHtml = `
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#0a0f1c;padding:24px;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="background:#111a2e;border-radius:16px;padding:32px;color:#fff">
        
        <tr><td align="center" style="padding-bottom:24px">
          <div style="font-size:32px;font-weight:800;background:linear-gradient(135deg, #57a4ff 0%, #6bb0ff 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">
            THANK YOU!
          </div>
        </td></tr>

        <tr><td align="center" style="padding-bottom:20px">
          <div style="font-size:18px;color:#fff;font-weight:600;margin-bottom:12px">
            We've received your message!
          </div>
          <div style="font-size:15px;color:#bcd;line-height:1.6">
            Thank you for reaching out to the Bombers Fastpitch. 
            Someone from our team will get back to you as soon as possible.
          </div>
        </td></tr>

        <tr><td style="background:#1a2438;border-radius:12px;padding:20px;border:1px solid #57a4ff33">
          <div style="font-size:14px;color:#9ab;margin-bottom:12px;font-weight:600">Your Message Details:</div>
          <div style="color:#cde;font-size:14px;line-height:1.8">
            <strong style="color:#57a4ff">Name:</strong> ${data.name}<br/>
            <strong style="color:#57a4ff">Email:</strong> ${data.email}<br/>
            <strong style="color:#57a4ff">Subject:</strong> ${data.subject}
          </div>
        </td></tr>

        <tr><td align="center" style="padding-top:24px">
          <div style="font-size:13px;color:#9ab;line-height:1.6">
            Questions? Contact us at <a href="mailto:bo@bombersfastpitch.net" style="color:#57a4ff;text-decoration:none">bo@bombersfastpitch.net</a>
          </div>
        </td></tr>

      </table>
    </td></tr>
  </table>`.trim();

  const confirmationText = `
THANK YOU FOR CONTACTING BOMBERS FASTPITCH!

We've received your message and someone from our team will get back to you as soon as possible.

Your Message Details:
- Name: ${data.name}
- Email: ${data.email}
- Subject: ${data.subject}

Questions? Contact us at bo@bombersfastpitch.net
`.trim();

  // Send confirmation to sender
  await sendEmail({
    to: data.email,
    subject: '✅ Bombers Fastpitch - Message Received',
    html: confirmationHtml,
    text: confirmationText,
  });

  return { success: true };
}
