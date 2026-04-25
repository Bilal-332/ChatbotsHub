import { Router } from 'express';
import { organizationController } from './organization.controller';
import { authenticate, requireRole } from '@core/middleware/authMiddleware';
import { body } from 'express-validator';
import { validateRequest } from '@shared/validateRequest';

const router = Router();

// Public endpoint — no auth required (used by widget)
router.get(
  '/public',
  organizationController.getPublicSettings.bind(organizationController),
);

router.use(authenticate);

router.get('/', organizationController.getMyOrganization.bind(organizationController));

router.get('/stats', organizationController.getStats.bind(organizationController));

router.patch(
  '/',
  requireRole('admin'),
  [
    body('name').optional().isString().trim().isLength({ min: 2, max: 100 }),
    body('settings.chatbotName').optional().isString().trim().isLength({ max: 50 }),
    body('settings.welcomeMessage').optional().isString().trim().isLength({ max: 200 }),
    body('settings.primaryColor')
      .optional()
      .matches(/^#[0-9A-Fa-f]{6}$/)
      .withMessage('Must be a valid hex color'),
    validateRequest,
  ],
  organizationController.updateOrganization.bind(organizationController),
);

router.post(
  '/regenerate-api-key',
  requireRole('admin'),
  organizationController.regenerateApiKey.bind(organizationController),
);

export { router as organizationRouter };
