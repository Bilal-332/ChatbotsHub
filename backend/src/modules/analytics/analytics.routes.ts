import { Router } from 'express';
import { analyticsController } from './analytics.controller';
import { authenticate } from '@core/middleware/authMiddleware';
import { query } from 'express-validator';
import { validateRequest } from '@shared/validateRequest';

const router = Router();

router.use(authenticate);

// Shared validation for the date-range query params on every analytics endpoint.
const rangeRules = [
  query('range').optional().isIn(['today', '7d', '30d', '90d', 'custom']).withMessage('Invalid range'),
  query('from').optional().isISO8601().withMessage('from must be an ISO8601 date'),
  query('to').optional().isISO8601().withMessage('to must be an ISO8601 date'),
];

const rangeValidators = [...rangeRules, validateRequest];

router.get('/overview', rangeValidators, analyticsController.overview.bind(analyticsController));
router.get('/engagement', rangeValidators, analyticsController.engagement.bind(analyticsController));
router.get('/knowledge', rangeValidators, analyticsController.knowledge.bind(analyticsController));
router.get(
  '/top-questions',
  [...rangeRules, query('limit').optional().isInt({ min: 1, max: 50 }), validateRequest],
  analyticsController.topQuestions.bind(analyticsController),
);
router.get('/timeseries', rangeValidators, analyticsController.timeseries.bind(analyticsController));
router.get('/leads', rangeValidators, analyticsController.leads.bind(analyticsController));

export { router as analyticsRouter };
