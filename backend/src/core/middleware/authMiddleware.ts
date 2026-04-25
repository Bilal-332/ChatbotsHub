import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '@shared/config';
import { UnauthorizedError, ForbiddenError } from '@shared/errors';
import type { JwtPayload, AuthenticatedRequest, UserRole } from '@shared/types';

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Bearer token required');
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, config.jwt.accessSecret) as JwtPayload;
    (req as AuthenticatedRequest).user = payload;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Access token expired');
    }
    throw new UnauthorizedError('Invalid access token');
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError();
    }
    if (!roles.includes(user.role)) {
      throw new ForbiddenError('Insufficient permissions');
    }
    next();
  };
}
