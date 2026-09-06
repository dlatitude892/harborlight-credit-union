import nodemailer from 'nodemailer';

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;
let warnedMissingConfig = false;

const getTransporter = () => {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    if (!warnedMissingConfig) {
      console.warn(
        '[mailer] SMTP_HOST/SMTP_USER/SMTP_PASS are not fully set - emails will not be sent. ' +
          'See README for setup instructions.'
      );
      warnedMissingConfig = true;
    }
    return null;
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  return transporter;
};

const fromAddress = () => process.env.SMTP_FROM || 'Harborlight Credit Union <no-reply@harborlight.example>';

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

export const sendOtpEmail = async (to: string, otp: string, reference: string, amount: number) => {
  const client = getTransporter();
  if (!client) return false;

  try {
    await client.sendMail({
      from: fromAddress(),
      to,
      subject: `Your Harborlight verification code: ${otp}`,
      html: otpEmailHtml(otp, reference, amount),
    });
    return true;
  } catch (error) {
    console.error('[mailer] Failed to send OTP email:', error);
    return false;
  }
};