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

  async refresh(req: Request, res: Response): Promise<void> {
    const { refreshToken } = req.body as { refreshToken: string };
    const tokens = await authService.refreshTokens(refreshToken);
    sendSuccess(res, { tokens }, 'Tokens refreshed');
  }

  async me(req: Request, res: Response): Promise<void> {
    const { userId } = (req as AuthenticatedRequest).user;
    const user = await authService.getMe(userId);
    sendSuccess(res, user);
  }
}

export const authController = new AuthController();
