import { Router } from 'express';
import { authController } from './auth.controller';
import { authenticate } from '@core/middleware/authMiddleware';
import { authRateLimiter } from '@core/middleware/rateLimiter';
import { body } from 'express-validator';
import { validateRequest } from '@shared/validateRequest';

const router = Router();

const passwordStrength = body('password')
  .isString()
  .isLength({ min: 8, max: 72 })
  .withMessage('Password must be 8–72 characters')
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  .withMessage('Password must contain uppercase, lowercase, and a number');

const slugValidator = body('organizationSlug')
  .isString()
  .trim()
  .isLength({ min: 2, max: 60 })
  .matches(/^[a-z0-9-]+$/)
  .withMessage('Slug may only contain lowercase letters, numbers, and hyphens');

router.post(
  '/register',
  authRateLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    passwordStrength,
    body('organizationName').isString().trim().isLength({ min: 2, max: 100 }),
    slugValidator,
    validateRequest,
  ],
  authController.register.bind(authController),
);

router.post(
  '/login',
  authRateLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isString().notEmpty(),
    validateRequest,
  ],
  authController.login.bind(authController),
);

router.post(
  '/forgot-password',
  authRateLimiter,
  [body('email').isEmail().normalizeEmail(), validateRequest],
  authController.forgotPassword.bind(authController),
);

router.post(
  '/reset-password',
  authRateLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('code').isString().matches(/^\d{6}$/),
    passwordStrength,
    validateRequest,
  ],
  authController.resetPassword.bind(authController),
);

router.post(
  '/google/register',
  authRateLimiter,
  [
    body('idToken').isString().notEmpty(),
    body('organizationName').isString().trim().isLength({ min: 2, max: 100 }),
    slugValidator,
    validateRequest,
  ],
  authController.googleRegister.bind(authController),
);

router.post(
  '/google/login',
  authRateLimiter,
  [body('idToken').isString().notEmpty(), validateRequest],
  authController.googleLogin.bind(authController),
);

router.post(
  '/refresh',
  [body('refreshToken').isString().notEmpty(), validateRequest],
  authController.refresh.bind(authController),
);

router.get('/me', authenticate, authController.me.bind(authController));

export { router as authRouter };
