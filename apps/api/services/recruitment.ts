import { sendEmail } from '../utils/email';

type RecruitmentSubmission = {
  // Basic Info
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  role: 'player' | 'coach' | 'parent';
  type: 'team' | 'individual';

  // Team Info (if type === 'team')
  teamName?: string;
  headCoach?: string;
  teamNotes?: string;
  ageGroup?: string;

  // Individual Info (if type === 'individual')
  mostRecentTeam?: string;
  yearsExperience?: string;
  primaryPosition?: string;
  individualNotes?: string;
  playerAgeGroup?: string;
};

export async function sendRecruitmentEmail(data: RecruitmentSubmission) {
  const isTeam = data.type === 'team';
  const ageGroupValue = isTeam ? data.ageGroup : data.playerAgeGroup;

  // Create HTML email for Bo
  const html = `
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#0a0f1c;padding:24px;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial">
    <tr><td align="center">
      <table width="700" cellpadding="0" cellspacing="0" role="presentation" style="background:#111a2e;border-radius:16px;padding:32px;color:#fff">
        
        <!-- Header -->
        <tr><td align="center" style="padding-bottom:24px">
          <div style="font-size:28px;font-weight:800;background:linear-gradient(135deg, #57a4ff 0%, #6bb0ff 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">
            NEW RECRUITMENT SUBMISSION
          </div>
          <div style="font-size:14px;color:#9ab;margin-top:8px;font-weight:600;text-transform:uppercase;letter-spacing:1px">
            ${isTeam ? '🏆 Team Application' : '⚾ Individual Application'}
          </div>
        </td></tr>

        <!-- Basic Information Card -->
        <tr><td style="padding-bottom:20px">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#1a2438;border-radius:12px;padding:20px;border:1px solid #57a4ff33">
            <tr><td style="font-size:12px;font-weight:700;color:#57a4ff;text-transform:uppercase;letter-spacing:1.5px;padding-bottom:12px">
              📋 Basic Information
            </td></tr>
            <tr><td>
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td width="50%" style="padding:8px 0">
                    <div style="color:#9ab;font-size:12px;margin-bottom:4px">Name</div>
                    <div style="color:#fff;font-size:15px;font-weight:600">${data.name}</div>
                  </td>
                  <td width="50%" style="padding:8px 0">
                    <div style="color:#9ab;font-size:12px;margin-bottom:4px">Role</div>
                    <div style="color:#fff;font-size:15px;font-weight:600;text-transform:capitalize">${data.role}</div>
                  </td>
                </tr>
                <tr>
                  <td width="50%" style="padding:8px 0">
                    <div style="color:#9ab;font-size:12px;margin-bottom:4px">Email</div>
                    <div style="color:#57a4ff;font-size:14px">
                      <a href="mailto:${data.email}" style="color:#57a4ff;text-decoration:none">${data.email}</a>
                    </div>
                  </td>
                  <td width="50%" style="padding:8px 0">
                    <div style="color:#9ab;font-size:12px;margin-bottom:4px">Phone</div>
                    <div style="color:#fff;font-size:14px">
                      <a href="tel:${data.phone}" style="color:#fff;text-decoration:none">${data.phone}</a>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td width="50%" style="padding:8px 0">
                    <div style="color:#9ab;font-size:12px;margin-bottom:4px">Location</div>
                    <div style="color:#fff;font-size:14px">${data.city}, ${data.state}</div>
                  </td>
                  <td width="50%" style="padding:8px 0">
                    <div style="color:#9ab;font-size:12px;margin-bottom:4px">Application Type</div>
                    <div style="color:#fff;font-size:14px;text-transform:capitalize">${data.type}</div>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </td></tr>

        ${
          isTeam
            ? `
        <!-- Team Information Card -->
        <tr><td style="padding-bottom:20px">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#1a2438;border-radius:12px;padding:20px;border:1px solid #57a4ff33">
            <tr><td style="font-size:12px;font-weight:700;color:#57a4ff;text-transform:uppercase;letter-spacing:1.5px;padding-bottom:12px">
              🏆 Team Information
            </td></tr>
            <tr><td>
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td width="50%" style="padding:8px 0">
                    <div style="color:#9ab;font-size:12px;margin-bottom:4px">Team Name</div>
                    <div style="color:#fff;font-size:15px;font-weight:600">${data.teamName || 'N/A'}</div>
                  </td>
                  <td width="50%" style="padding:8px 0">
                    <div style="color:#9ab;font-size:12px;margin-bottom:4px">Head Coach</div>
                    <div style="color:#fff;font-size:15px;font-weight:600">${data.headCoach || 'N/A'}</div>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding:8px 0">
                    <div style="color:#9ab;font-size:12px;margin-bottom:4px">Age Group</div>
                    <div style="color:#fff;font-size:15px;font-weight:600">${ageGroupValue || 'N/A'}</div>
                  </td>
                </tr>
                ${
                  data.teamNotes
                    ? `
                <tr>
                  <td colspan="2" style="padding:12px 0">
                    <div style="color:#9ab;font-size:12px;margin-bottom:8px">Additional Notes</div>
                    <div style="color:#cde;font-size:14px;line-height:1.6;background:#0f1824;padding:12px;border-radius:8px;border-left:3px solid #57a4ff">
                      ${data.teamNotes.replace(/\n/g, '<br/>')}
                    </div>
                  </td>
                </tr>
                `
                    : ''
                }
              </table>
            </td></tr>
          </table>
        </td></tr>
        `
            : `
        <!-- Individual/Player Information Card -->
        <tr><td style="padding-bottom:20px">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#1a2438;border-radius:12px;padding:20px;border:1px solid #57a4ff33">
            <tr><td style="font-size:12px;font-weight:700;color:#57a4ff;text-transform:uppercase;letter-spacing:1.5px;padding-bottom:12px">
              ⚾ Player Information
            </td></tr>
            <tr><td>
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                ${
                  data.mostRecentTeam
                    ? `
                <tr>
                  <td colspan="2" style="padding:8px 0">
                    <div style="color:#9ab;font-size:12px;margin-bottom:4px">Most Recent Team</div>
                    <div style="color:#fff;font-size:15px;font-weight:600">${data.mostRecentTeam}</div>
                  </td>
                </tr>
                `
                    : ''
                }
                <tr>
                  <td width="33%" style="padding:8px 0">
                    <div style="color:#9ab;font-size:12px;margin-bottom:4px">Experience</div>
                    <div style="color:#fff;font-size:15px;font-weight:600">${data.yearsExperience || 'N/A'} years</div>
                  </td>
                  <td width="33%" style="padding:8px 0">
                    <div style="color:#9ab;font-size:12px;margin-bottom:4px">Primary Position</div>
                    <div style="color:#fff;font-size:15px;font-weight:600">${data.primaryPosition || 'N/A'}</div>
                  </td>
                  <td width="34%" style="padding:8px 0">
                    <div style="color:#9ab;font-size:12px;margin-bottom:4px">Age Group</div>
                    <div style="color:#fff;font-size:15px;font-weight:600">${ageGroupValue || 'N/A'}</div>
                  </td>
                </tr>
                ${
                  data.individualNotes
                    ? `
                <tr>
                  <td colspan="3" style="padding:12px 0">
                    <div style="color:#9ab;font-size:12px;margin-bottom:8px">Additional Notes</div>
                    <div style="color:#cde;font-size:14px;line-height:1.6;background:#0f1824;padding:12px;border-radius:8px;border-left:3px solid #57a4ff">
                      ${data.individualNotes.replace(/\n/g, '<br/>')}
                    </div>
                  </td>
                </tr>
                `
                    : ''
                }
              </table>
            </td></tr>
          </table>
        </td></tr>
        `
        }

        <!-- Footer with Call to Action -->
        <tr><td align="center" style="padding-top:12px">
          <div style="font-size:12px;color:#9ab;line-height:1.6">
            This submission was received from the Bombers Fastpitch website recruitment form.<br/>
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
NEW RECRUITMENT SUBMISSION - ${isTeam ? 'Team Application' : 'Individual Application'}

BASIC INFORMATION
-----------------
Name: ${data.name}
Role: ${data.role}
Email: ${data.email}
Phone: ${data.phone}
Location: ${data.city}, ${data.state}
Application Type: ${data.type}

${
  isTeam
    ? `
TEAM INFORMATION
----------------
Team Name: ${data.teamName || 'N/A'}
Head Coach: ${data.headCoach || 'N/A'}
Age Group: ${ageGroupValue || 'N/A'}
${data.teamNotes ? `\nAdditional Notes:\n${data.teamNotes}` : ''}
`
    : `
PLAYER INFORMATION
------------------
${data.mostRecentTeam ? `Most Recent Team: ${data.mostRecentTeam}\n` : ''}Experience: ${data.yearsExperience || 'N/A'} years
Primary Position: ${data.primaryPosition || 'N/A'}
Age Group: ${ageGroupValue || 'N/A'}
${data.individualNotes ? `\nAdditional Notes:\n${data.individualNotes}` : ''}
`
}

Submitted on ${new Date().toLocaleString('en-US', {
    timeZone: 'America/Chicago',
    dateStyle: 'full',
    timeStyle: 'short',
  })}
`.trim();

  // Send email to Bo
  await sendEmail({
    to: 'bo@bombersfastpitch.net',
    subject: `🎯 New Recruitment: ${data.name} - ${isTeam ? 'Team' : 'Individual'} (${ageGroupValue || 'N/A'})`,
    html,
    text,
    replyTo: data.email,
  });

  // Send confirmation email to applicant
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
            Thanks for your interest in joining the Bombers!
          </div>
          <div style="font-size:15px;color:#bcd;line-height:1.6">
            We've received your ${isTeam ? 'team' : 'individual'} application and our coaching staff will review it shortly. 
            Someone from our team will reach out to you within the next few days.
          </div>
        </td></tr>

        <tr><td style="background:#1a2438;border-radius:12px;padding:20px;border:1px solid #57a4ff33">
          <div style="font-size:14px;color:#9ab;margin-bottom:12px;font-weight:600">Your Submission Details:</div>
          <div style="color:#cde;font-size:14px;line-height:1.8">
            <strong style="color:#57a4ff">Name:</strong> ${data.name}<br/>
            <strong style="color:#57a4ff">Email:</strong> ${data.email}<br/>
            <strong style="color:#57a4ff">Type:</strong> ${isTeam ? 'Team' : 'Individual'}<br/>
            <strong style="color:#57a4ff">Age Group:</strong> ${ageGroupValue || 'N/A'}
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
THANK YOU FOR YOUR INTEREST IN JOINING THE BOMBERS!

We've received your ${isTeam ? 'team' : 'individual'} application and our coaching staff will review it shortly. 
Someone from our team will reach out to you within the next few days.

Your Submission Details:
- Name: ${data.name}
- Email: ${data.email}
- Type: ${isTeam ? 'Team' : 'Individual'}
- Age Group: ${ageGroupValue || 'N/A'}

Questions? Contact us at bo@bombersfastpitch.net
`.trim();

  // Send confirmation to applicant
  await sendEmail({
    to: data.email,
    subject: '✅ Bombers Fastpitch - Application Received',
    html: confirmationHtml,
    text: confirmationText,
  });

  return { success: true };
}
