import { Resend } from 'resend';
import { config } from '@shared/config';
import { AppError } from '@shared/errors';
import { logger } from '@shared/logger';

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

  const result = await resend.emails.send({
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

  if (result.error) {
    const error = result.error as
      | string
      | { message?: string; name?: string; statusCode?: number; code?: string };
    const message = typeof error === 'string'
      ? error
      : error.message ?? JSON.stringify(error);
    logger.error(`Resend email send failed: ${message}`);
    if (typeof error !== 'string') {
      if (error.name) logger.error(`Resend error name: ${error.name}`);
      if (error.code) logger.error(`Resend error code: ${error.code}`);
      if (typeof error.statusCode === 'number') {
        logger.error(`Resend error status: ${error.statusCode}`);
      }
    }
    throw new AppError('Failed to send reset email', 502, 'EMAIL_SEND_FAILED');
  }
}
