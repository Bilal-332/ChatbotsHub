import { Request, Response } from 'express';
import { chatService } from './chat.service';
import { sendSuccess } from '@shared/apiResponse';
import type { ApiKeyRequest } from '@shared/types';

export class ChatController {
  async query(req: Request, res: Response): Promise<void> {
    const organizationId = (req as ApiKeyRequest).organizationId;
    const { question } = req.body as { question: string };

    const result = await chatService.query({ question, organizationId });
    sendSuccess(res, result);
  }
}

export const chatController = new ChatController();
