import { Router } from 'express';
import { documentController } from './document.controller';
import { authenticate, requireRole } from '@core/middleware/authMiddleware';
import { checkDocumentLimit } from '@core/middleware/planLimitMiddleware';
import { param } from 'express-validator';
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
