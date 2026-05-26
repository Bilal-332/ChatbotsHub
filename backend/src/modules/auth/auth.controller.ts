import { Request, Response } from 'express';
import { authService } from './auth.service';
import { sendSuccess, sendCreated } from '@shared/apiResponse';
import type { AuthenticatedRequest } from '@shared/types';

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    const result = await authService.register(req.body);
    sendCreated(res, result, 'Account created successfully');
  }

  async login(req: Request, res: Response): Promise<void> {
    const result = await authService.login(req.body);
    sendSuccess(res, result, 'Login successful');
  }

  async googleRegister(req: Request, res: Response): Promise<void> {
    const result = await authService.googleRegister(req.body);
    sendCreated(res, result, 'Account created successfully');
  }

  async googleLogin(req: Request, res: Response): Promise<void> {
    const result = await authService.googleLogin(req.body);
    sendSuccess(res, result, 'Login successful');
  }

  async refresh(req: Request, res: Response): Promise<void> {
    const { refreshToken } = req.body as { refreshToken: string };
    const tokens = await authService.refreshTokens(refreshToken);
    sendSuccess(res, { tokens }, 'Tokens refreshed');
  }

  async forgotPassword(req: Request, res: Response): Promise<void> {
    const { email } = req.body as { email: string };
    await authService.requestPasswordReset(email);
    sendSuccess(res, null, 'If an account exists, a reset code has been sent');
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    const { email, code, password } = req.body as {
      email: string;
      code: string;
      password: string;
    };
    await authService.resetPassword(email, code, password);
    sendSuccess(res, null, 'Password reset successful');
  }

  async me(req: Request, res: Response): Promise<void> {
    const { userId, organizationId, role } = (req as AuthenticatedRequest).user;
    const user = await authService.getMe(userId, organizationId, role);
    sendSuccess(res, user);
  }
}

export const authController = new AuthController();
