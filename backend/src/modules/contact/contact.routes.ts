import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { body } from 'express-validator';
import { validateRequest } from '@shared/validateRequest';
import { contactController } from './contact.controller';

const router = Router();

const contactRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip ?? 'unknown',
  message: {
    success: false,
    message: 'Too many contact requests. Please try again later.',
    code: 'CONTACT_RATE_LIMIT',
  },
});

router.post(
  '/',
  contactRateLimiter,
  [
    body('name').isString().trim().isLength({ min: 2, max: 100 }),
    body('email').isEmail().normalizeEmail(),
    body('message').isString().trim().isLength({ min: 10, max: 2000 }),
    body('company').optional().isString().trim().isLength({ max: 100 }),
    body('website').optional().isString(),
    validateRequest,
  ],
  contactController.submit.bind(contactController),
);

export { router as contactRouter };
