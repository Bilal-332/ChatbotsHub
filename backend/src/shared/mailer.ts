import { Resend } from 'resend';
import { config } from '@shared/config';
import { AppError } from '@shared/errors';

const OTP_EXPIRY_MINUTES = 10;

let resendClient: Resend | null = null;

function ensureResendClient(): Resend {
  if (resendClient) return resendClient;

  const { apiKey, from } = config.resend;
  if (!apiKey || !from) {
    throw new AppError('Email service not configured', 500, 'EMAIL_NOT_CONFIGURED');
  }

  resendClient = new Resend(apiKey);
  return resendClient;
}

export async function sendPasswordResetOtp(to: string, otp: string): Promise<void> {
  const resend = ensureResendClient();
  const from = config.resend.from as string;

  await resend.emails.send({
    from,
    to,
    subject: 'Your ChatbotsHub password reset code',
    text: `Your password reset code is ${otp}. It expires in ${OTP_EXPIRY_MINUTES} minutes. If you did not request this, you can ignore this email.`,
    html: `
      <p>Your password reset code is <strong>${otp}</strong>.</p>
      <p>This code expires in ${OTP_EXPIRY_MINUTES} minutes.</p>
      <p>If you did not request this, you can safely ignore this email.</p>
    `,
  });
}
