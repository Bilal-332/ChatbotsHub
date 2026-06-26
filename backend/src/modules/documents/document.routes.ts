import { Router } from 'express';
import { documentController } from './document.controller';
import { authenticate, requireRole } from '@core/middleware/authMiddleware';
import { checkDocumentLimit, checkCrawlLimit } from '@core/middleware/planLimitMiddleware';
import { crawlRateLimiter } from '@core/middleware/rateLimiter';
import { body, param } from 'express-validator';
import { validateRequest } from '@shared/validateRequest';

const router = Router();

router.use(authenticate);

const documentIdParam = [
  param('id').isMongoId().withMessage('Invalid document ID'),
  validateRequest,
];

router.get('/', documentController.list.bind(documentController));

router.get(
  '/:id',
  documentIdParam,
  documentController.getOne.bind(documentController),
);

router.post(
  '/',
  requireRole('admin'),
  checkDocumentLimit,
  documentController.upload.bind(documentController),
);

router.post(
  '/url',
  requireRole('admin'),
  crawlRateLimiter,
  [
    body('url')
      .isString()
      .withMessage('A website URL is required')
      .bail()
      .trim()
      .isURL({ protocols: ['http', 'https'], require_protocol: true })
      .withMessage('Enter a valid website URL (including http:// or https://)')
      .isLength({ max: 2048 })
      .withMessage('URL is too long'),
    validateRequest,
  ],
  checkCrawlLimit,
  documentController.trainUrl.bind(documentController),
);

router.delete(
  '/:id',
  requireRole('admin'),
  documentIdParam,
  documentController.delete.bind(documentController),
);

router.post(
  '/:id/reprocess',
  requireRole('admin'),
  documentIdParam,
  documentController.reprocess.bind(documentController),
);

export { router as documentRouter };
