let warnedMissingConfig = false;

const fromAddress = () => process.env.EMAIL_FROM || 'Harborlight Credit Union <onboarding@resend.dev>';

const otpEmailHtml = (otp: string, reference: string, amount: number) => `
  <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #14261e;">
    <div style="background: #14512f; padding: 24px; border-radius: 12px 12px 0 0;">
      <h1 style="color: #fff; margin: 0; font-size: 18px;">Harborlight Credit Union</h1>
    </div>
    <div style="border: 1px solid #dfeee6; border-top: none; padding: 28px 24px; border-radius: 0 0 12px 12px;">
      <p style="font-size: 15px; margin: 0 0 18px;">
        Use this code to verify a transfer of <strong>$${amount.toFixed(2)}</strong>
        (reference ${reference}):
      </p>
      <div style="font-family: 'Courier New', monospace; font-size: 32px; font-weight: bold; letter-spacing: 6px; text-align: center; background: #eaf6ee; color: #14512f; padding: 16px; border-radius: 8px; margin-bottom: 18px;">
        ${otp}
      </div>
      <p style="font-size: 13px; color: #4b5d55; margin: 0;">
        This code expires in 10 minutes. If you didn't request this transfer, contact customer
        care immediately and do not share this code with anyone - Harborlight will never ask
        for it.
      </p>
    </div>
  </div>
`;

/**
 * Sends via Resend's HTTP API (a plain HTTPS POST) instead of raw SMTP.
 * Many hosts - including Render's free tier - block outbound SMTP ports
 * (25/465/587) entirely regardless of which mail provider you're sending
 * to, since it's a common spam vector on free hosting. HTTPS on port 443
 * doesn't have that problem, since blocking it would break almost every
 * other outbound API call an app makes too.
 */
const sendViaResend = async (to: string, subject: string, html: string, logLabel: string) => {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    if (!warnedMissingConfig) {
      console.warn('[mailer] RESEND_API_KEY is not set - emails will not be sent. See README for setup instructions.');
      warnedMissingConfig = true;
    }
    return false;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: fromAddress(), to, subject, html }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error(`[mailer] Resend API error sending ${logLabel} (${response.status}):`, body);
      return false;
    }

    return true;
  } catch (error) {
    // Never let an email failure break the transaction flow - the transfer
    // still exists and can be reviewed/retried; just log it for visibility.
    console.error(`[mailer] Failed to send ${logLabel}:`, error);
    return false;
  }
};

export const sendOtpEmail = (to: string, otp: string, reference: string, amount: number) =>
  sendViaResend(to, `Your Harborlight verification code: ${otp}`, otpEmailHtml(otp, reference, amount), 'OTP email');

interface ReceiptOptions {
  direction: 'DEBIT' | 'CREDIT';
  amount: number;
  reference: string;
  description: string;
  category: string;
  date: Date;
  counterpartyName?: string;
}

const receiptEmailHtml = (opts: ReceiptOptions) => {
  const { direction, amount, reference, description, category, date, counterpartyName } = opts;
  const color = direction === 'DEBIT' ? '#c0453a' : '#1f7a4d';
  const sign = direction === 'DEBIT' ? '-' : '+';
  const verb = direction === 'DEBIT' ? 'Sent' : 'Received';

  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #14261e;">
      <div style="background: #14512f; padding: 24px; border-radius: 12px 12px 0 0;">
        <h1 style="color: #fff; margin: 0; font-size: 18px;">Harborlight Credit Union</h1>
        <p style="color: #d7e8dd; margin: 4px 0 0; font-size: 13px;">Transaction receipt</p>
      </div>
      <div style="border: 1px solid #dfeee6; border-top: none; padding: 28px 24px; border-radius: 0 0 12px 12px;">
        <p style="font-size: 13px; color: #4b5d55; margin: 0 0 6px;">${verb}</p>
        <div style="font-family: 'Courier New', monospace; font-size: 30px; font-weight: bold; color: ${color}; margin-bottom: 18px;">
          ${sign}$${amount.toFixed(2)}
        </div>
        <table style="width: 100%; font-size: 13.5px; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #7c8f86; border-top: 1px solid #eef4f0;">Reference</td>
            <td style="padding: 8px 0; text-align: right; border-top: 1px solid #eef4f0;">${reference}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #7c8f86; border-top: 1px solid #eef4f0;">Date</td>
            <td style="padding: 8px 0; text-align: right; border-top: 1px solid #eef4f0;">${date.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #7c8f86; border-top: 1px solid #eef4f0;">Category</td>
            <td style="padding: 8px 0; text-align: right; border-top: 1px solid #eef4f0;">${category}</td>
          </tr>
          ${
            counterpartyName
              ? `<tr>
            <td style="padding: 8px 0; color: #7c8f86; border-top: 1px solid #eef4f0;">${direction === 'DEBIT' ? 'To' : 'From'}</td>
            <td style="padding: 8px 0; text-align: right; border-top: 1px solid #eef4f0;">${counterpartyName}</td>
          </tr>`
              : ''
          }
          ${
            description
              ? `<tr>
            <td style="padding: 8px 0; color: #7c8f86; border-top: 1px solid #eef4f0;">Description</td>
            <td style="padding: 8px 0; text-align: right; border-top: 1px solid #eef4f0;">${description}</td>
          </tr>`
              : ''
          }
        </table>
        <p style="font-size: 12px; color: #7c8f86; margin: 20px 0 0;">
          Harborlight Credit Union is federally insured by the NCUA. If you don't recognize this
          transaction, contact customer care immediately.
        </p>
      </div>
    </div>
  `;
};

export const sendReceiptEmail = (to: string, opts: ReceiptOptions) =>
  sendViaResend(
    to,
    `Receipt: ${opts.direction === 'DEBIT' ? '-' : '+'}$${opts.amount.toFixed(2)} (${opts.reference})`,
    receiptEmailHtml(opts),
    'receipt email'
  );