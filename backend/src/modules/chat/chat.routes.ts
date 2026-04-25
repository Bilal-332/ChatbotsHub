import { Router } from 'express';
import { chatController } from './chat.controller';
import { validateApiKey } from '@core/middleware/apiKeyMiddleware';
import { checkQueryLimit } from '@core/middleware/planLimitMiddleware';
import { chatRateLimiter } from '@core/middleware/rateLimiter';
import { body } from 'express-validator';
import { validateRequest } from '@shared/validateRequest';

const router = Router();

/**
 * POST /api/chat/query
 * Public endpoint authenticated via API key header (x-api-key).
 * Used by the embeddable widget.
 */
router.post(
  '/query',
  chatRateLimiter,
  validateApiKey,
  checkQueryLimit,
  [
    body('question')
      .isString()
      .trim()
      .isLength({ min: 1, max: 1000 })
      .withMessage('Question must be 1–1000 characters'),
    body('conversationId')
      .optional()
      .isString()
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage('conversationId must be 3–100 characters'),
    validateRequest,
  ],
  chatController.query.bind(chatController),
);

export { router as chatRouter };
