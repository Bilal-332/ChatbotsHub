import { Router } from 'express';
import { body, query } from 'express-validator';
import { adminController } from './admin.controller';
import { authenticate, requireRole } from '@core/middleware/authMiddleware';
import { validateRequest } from '@shared/validateRequest';
import { PLAN_NAMES } from '@modules/plans/plan.constants';

const router = Router();

router.use(authenticate, requireRole('super_admin'));

router.get(
	'/organizations',
	[
		query('page').optional().isInt({ min: 1 }),
		query('limit').optional().isInt({ min: 1, max: 100 }),
		query('search').optional().isString().trim().isLength({ min: 1, max: 100 }),
		validateRequest,
	],
	adminController.listOrganizations.bind(adminController),
);

router.post(
	'/organizations',
	[
		body('name').isString().trim().isLength({ min: 2, max: 100 }),
		body('slug')
			.isString()
			.trim()
			.isLength({ min: 2, max: 60 })
			.matches(/^[a-z0-9-]+$/),
		body('plan').optional().isIn(PLAN_NAMES),
		body('isActive').optional().isBoolean(),
		validateRequest,
	],
	adminController.createOrganization.bind(adminController),
);

router.get('/organizations/:id', adminController.getOrganization.bind(adminController));

router.patch(
	'/organizations/:id',
	[
		body('name').optional().isString().trim().isLength({ min: 2, max: 100 }),
		body('slug')
			.optional()
			.isString()
			.trim()
			.isLength({ min: 2, max: 60 })
			.matches(/^[a-z0-9-]+$/),
		body('plan').optional().isIn(PLAN_NAMES),
		body('isActive').optional().isBoolean(),
		validateRequest,
	],
	adminController.updateOrganization.bind(adminController),
);

router.delete(
	'/organizations/:id',
	adminController.deleteOrganization.bind(adminController),
);

router.post(
	'/organizations/:id/impersonate',
	adminController.impersonateOrganization.bind(adminController),
);

router.get(
	'/users',
	[
		query('page').optional().isInt({ min: 1 }),
		query('limit').optional().isInt({ min: 1, max: 100 }),
		query('search').optional().isString().trim().isLength({ min: 1, max: 100 }),
		query('organizationId').optional().isString(),
		query('role').optional().isIn(['admin', 'member', 'super_admin']),
		validateRequest,
	],
	adminController.listUsers.bind(adminController),
);

router.post(
	'/users',
	[
		body('email').isEmail().normalizeEmail(),
		body('password')
			.isString()
			.isLength({ min: 8, max: 72 })
			.matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
			.withMessage('Password must contain uppercase, lowercase, and a number'),
		body('role').isIn(['admin', 'member', 'super_admin']),
		body('organizationId').isString().notEmpty(),
		body('isActive').optional().isBoolean(),
		validateRequest,
	],
	adminController.createUser.bind(adminController),
);

router.get('/users/:id', adminController.getUser.bind(adminController));

router.patch(
	'/users/:id',
	[
		body('email').optional().isEmail().normalizeEmail(),
		body('password')
			.optional()
			.isString()
			.isLength({ min: 8, max: 72 })
			.matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
			.withMessage('Password must contain uppercase, lowercase, and a number'),
		body('role').optional().isIn(['admin', 'member', 'super_admin']),
		body('organizationId').optional().isString().notEmpty(),
		body('isActive').optional().isBoolean(),
		validateRequest,
	],
	adminController.updateUser.bind(adminController),
);

router.delete('/users/:id', adminController.deleteUser.bind(adminController));

export { router as adminRouter };
