import { Request, Response } from 'express';
import { chatService } from './chat.service';
import { sendSuccess } from '@shared/apiResponse';
import type { ApiKeyRequest } from '@shared/types';

export class ChatController {
  async query(req: Request, res: Response): Promise<void> {
    const organizationId = (req as ApiKeyRequest).organizationId;
    const { question, conversationId } = req.body as {
      question: string;
      conversationId?: string;
    };

    const result = await chatService.query({ question, organizationId, conversationId });
    sendSuccess(res, result);
  }
}

export const chatController = new ChatController();
