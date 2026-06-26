import { Request, Response } from 'express';
import { chatService } from './chat.service';
import { recordChatAnalytics } from '@modules/analytics/analytics.service';
import { sendSuccess } from '@shared/apiResponse';
import type { ApiKeyRequest } from '@shared/types';

export class ChatController {
  async query(req: Request, res: Response): Promise<void> {
    const organizationId = (req as ApiKeyRequest).organizationId;
    const { question, conversationId } = req.body as {
      question: string;
      conversationId?: string;
    };
    const visitorId = req.headers['x-visitor-id'] as string | undefined;

    const result = await chatService.query({ question, organizationId, conversationId });

    // Persist analytics without blocking the chat response.
    recordChatAnalytics({
      organizationId,
      conversationId,
      visitorId,
      question,
      answered: result.answered ?? result.hasContext,
      confidence: result.confidence,
      sourceChunks: result.sourceChunks,
    });

    sendSuccess(res, result);
  }
}

export const chatController = new ChatController();
