import { sendContactFormEmail } from '@shared/mailer';
import { AppError } from '@shared/errors';

export interface ContactFormDto {
  name: string;
  email: string;
  message: string;
  company?: string;
  /** Honeypot field — must be empty */
  website?: string;
}

const MIN_MESSAGE_LENGTH = 10;
const MAX_MESSAGE_LENGTH = 2000;

export class ContactService {
  async submit(dto: ContactFormDto): Promise<void> {
    // Spam protection: honeypot must be empty
    if (dto.website?.trim()) {
      // Silently accept to avoid revealing the trap
      return;
    }

    const name = dto.name.trim();
    const email = dto.email.trim().toLowerCase();
    const message = dto.message.trim();
    const company = dto.company?.trim();

    if (name.length < 2) {
      throw new AppError('Name must be at least 2 characters', 400, 'INVALID_INPUT');
    }

    if (message.length < MIN_MESSAGE_LENGTH) {
      throw new AppError(
        `Message must be at least ${MIN_MESSAGE_LENGTH} characters`,
        400,
        'INVALID_INPUT',
      );
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      throw new AppError('Message is too long', 400, 'INVALID_INPUT');
    }

    await sendContactFormEmail({ name, email, message, company });
  }
}

export const contactService = new ContactService();
