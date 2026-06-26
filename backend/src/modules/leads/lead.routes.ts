import { Router } from 'express';
import { leadController } from './lead.controller';
import { authenticate, requireRole } from '@core/middleware/authMiddleware';
import { validateApiKey } from '@core/middleware/apiKeyMiddleware';
import { leadRateLimiter } from '@core/middleware/rateLimiter';
import { body, param, query } from 'express-validator';
import { validateRequest } from '@shared/validateRequest';

const router = Router();

// ─── Public (widget, API-key auth) ───────────────────────────────────────────
router.post(
  '/',
  leadRateLimiter,
  validateApiKey,
  [
    body('name').isString().trim().notEmpty().withMessage('Name is required').isLength({ max: 120 }),
    body('email').isEmail().withMessage('A valid email is required').normalizeEmail().isLength({ max: 200 }),
    body('phone').optional({ values: 'falsy' }).isString().trim().isLength({ max: 40 }),
    body('company').optional({ values: 'falsy' }).isString().trim().isLength({ max: 160 }),
    body('message').optional({ values: 'falsy' }).isString().trim().isLength({ max: 2000 }),
    body('conversationId').optional({ values: 'falsy' }).isString().trim().isLength({ max: 100 }),
    body('intent').optional({ values: 'falsy' }).isString().trim().isLength({ max: 40 }),
    validateRequest,
  ],
  leadController.submit.bind(leadController),
);

router.post(
  '/intent',
  leadRateLimiter,
  validateApiKey,
  [
    body('message').isString().withMessage('message is required').isLength({ max: 500 }),
    validateRequest,
  ],
  leadController.classifyIntent.bind(leadController),
);

// ─── Dashboard (JWT auth) ─────────────────────────────────────────────────────
router.get(
  '/',
  authenticate,
  [
    query('status').optional().isIn(['new', 'contacted', 'qualified', 'closed']),
    validateRequest,
  ],
  leadController.list.bind(leadController),
);

router.get(
  '/export',
  authenticate,
  [
    query('status').optional().isIn(['new', 'contacted', 'qualified', 'closed']),
    validateRequest,
  ],
  leadController.exportCsv.bind(leadController),
);

router.patch(
  '/:id',
  authenticate,
  requireRole('admin'),
  [
    param('id').isMongoId().withMessage('Invalid lead ID'),
    body('status').isIn(['new', 'contacted', 'qualified', 'closed']).withMessage('Invalid status'),
    validateRequest,
  ],
  leadController.updateStatus.bind(leadController),
);

export { router as leadRouter };
