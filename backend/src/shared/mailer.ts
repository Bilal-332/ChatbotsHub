import { Resend } from 'resend';
import { config } from '@shared/config';
import { AppError } from '@shared/errors';
import { logger } from '@shared/logger';

const OTP_EXPIRY_MINUTES = 10;

let resendClient: Resend | null = null;

/** Escape user-supplied values before interpolating them into email HTML. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

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

export interface LeadNotificationPayload {
  leadName: string;
  leadEmail: string;
  phone?: string;
  company?: string;
  message?: string;
  botName: string;
  intent?: string;
}

/**
 * Notify an organization admin that a new lead was captured by their chatbot.
 * Designed to be called fire-and-forget: it throws on failure so callers can
 * log, but lead persistence must never depend on email succeeding.
 */
export async function sendLeadNotificationEmail(
  to: string,
  payload: LeadNotificationPayload,
): Promise<void> {
  const resend = ensureResendClient();
  const from = config.resend.from as string;

  const lines = [
    `Name: ${payload.leadName}`,
    `Email: ${payload.leadEmail}`,
    payload.phone ? `Phone: ${payload.phone}` : null,
    payload.company ? `Company: ${payload.company}` : null,
    payload.intent ? `Intent: ${payload.intent}` : null,
    payload.message ? `\nMessage:\n${payload.message}` : null,
  ].filter((line): line is string => line !== null);

  const result = await resend.emails.send({
    from,
    to,
    reply_to: payload.leadEmail,
    subject: `[ChatbotsHub] New lead from ${payload.botName}: ${payload.leadName}`,
    text: `You captured a new lead via ${payload.botName}.\n\n${lines.join('\n')}`,
    html: `
      <h2>New lead captured by ${escapeHtml(payload.botName)}</h2>
      <p><strong>Name:</strong> ${escapeHtml(payload.leadName)}</p>
      <p><strong>Email:</strong> <a href="mailto:${escapeHtml(payload.leadEmail)}">${escapeHtml(payload.leadEmail)}</a></p>
      ${payload.phone ? `<p><strong>Phone:</strong> ${escapeHtml(payload.phone)}</p>` : ''}
      ${payload.company ? `<p><strong>Company:</strong> ${escapeHtml(payload.company)}</p>` : ''}
      ${payload.intent ? `<p><strong>Intent:</strong> ${escapeHtml(payload.intent)}</p>` : ''}
      ${payload.message ? `<hr /><p>${escapeHtml(payload.message).replace(/\n/g, '<br />')}</p>` : ''}
    `,
  });

  if (result.error) {
    const error = result.error as
      | string
      | { message?: string; name?: string; statusCode?: number; code?: string };
    const message = typeof error === 'string' ? error : error.message ?? JSON.stringify(error);
    logger.error(`Resend lead notification failed: ${message}`);
    throw new AppError('Failed to send lead notification', 502, 'EMAIL_SEND_FAILED');
  }
}

export interface ContactFormPayload {
  name: string;
  email: string;
  message: string;
  company?: string;
}

export async function sendContactFormEmail(payload: ContactFormPayload): Promise<void> {
  const resend = ensureResendClient();
  const from = config.resend.from as string;
  const to = config.contact.email;

  const companyLine = payload.company ? `\nCompany: ${payload.company}` : '';

  const result = await resend.emails.send({
    from,
    to,
    reply_to: payload.email,
    subject: `[ChatbotsHub Contact] Message from ${payload.name}`,
    text: `Name: ${payload.name}\nEmail: ${payload.email}${companyLine}\n\nMessage:\n${payload.message}`,
    html: `
      <h2>New contact form submission</h2>
      <p><strong>Name:</strong> ${payload.name}</p>
      <p><strong>Email:</strong> <a href="mailto:${payload.email}">${payload.email}</a></p>
      ${payload.company ? `<p><strong>Company:</strong> ${payload.company}</p>` : ''}
      <hr />
      <p>${payload.message.replace(/\n/g, '<br />')}</p>
    `,
  });

  if (result.error) {
    const error = result.error as
      | string
      | { message?: string; name?: string; statusCode?: number; code?: string };
    const message = typeof error === 'string'
      ? error
      : error.message ?? JSON.stringify(error);
    logger.error(`Resend contact email failed: ${message}`);
    throw new AppError('Failed to send message. Please try again later.', 502, 'EMAIL_SEND_FAILED');
  }
}
