import { Request, Response } from 'express';
import { contactService } from './contact.service';
import { sendSuccess } from '@shared/apiResponse';

export class ContactController {
  async submit(req: Request, res: Response): Promise<void> {
    await contactService.submit(req.body);
    sendSuccess(res, null, 'Message sent successfully. We will get back to you soon.');
  }
}

export const contactController = new ContactController();
