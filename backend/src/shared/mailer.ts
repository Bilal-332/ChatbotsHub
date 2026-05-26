import nodemailer from 'nodemailer';
import { config } from '@shared/config';
import { AppError } from '@shared/errors';

const OTP_EXPIRY_MINUTES = 10;

let transporter: nodemailer.Transporter | null = null;

function ensureTransporter(): nodemailer.Transporter {
  if (transporter) return transporter;

  const { host, port, user, pass, from } = config.smtp;
  if (!host || !port || !user || !pass || !from) {
    throw new AppError('Email service not configured', 500, 'EMAIL_NOT_CONFIGURED');
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: config.smtp.secure || port === 465,
    auth: { user, pass },
  });

  return transporter;
}

export async function sendPasswordResetOtp(to: string, otp: string): Promise<void> {
  const transport = ensureTransporter();
  const from = config.smtp.from as string;

  await transport.sendMail({
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
