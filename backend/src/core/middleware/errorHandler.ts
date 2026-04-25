import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '@shared/errors';
import { logger } from '@shared/logger';
import { config } from '@shared/config';

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Operational errors (expected, safe to expose to client)
  if (error instanceof ValidationError) {
    res.status(422).json({
      success: false,
      message: error.message,
      code: error.code,
      errors: error.errors,
    });
    return;
  }

  if (error instanceof AppError) {
    if (error.statusCode >= 500) {
      logger.error(`[${req.method}] ${req.path}`, { error: error.message, stack: error.stack });
    }
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      code: error.code,
    });
    return;
  }

  // Mongoose duplicate key error
  if ((error as NodeJS.ErrnoException).name === 'MongoServerError') {
    const mongoError = error as Error & { code?: number; keyValue?: Record<string, unknown> };
    if (mongoError.code === 11000) {
      const field = Object.keys(mongoError.keyValue ?? {})[0] ?? 'field';
      res.status(409).json({
        success: false,
        message: `${field} already exists`,
        code: 'DUPLICATE_KEY',
      });
      return;
    }
  }

  // Mongoose validation error
  if (error.name === 'ValidationError') {
    res.status(422).json({
      success: false,
      message: 'Validation failed',
      code: 'MONGOOSE_VALIDATION',
    });
    return;
  }

  // Unexpected errors - log fully, expose minimal info
  logger.error(`Unhandled error [${req.method}] ${req.path}`, {
    error: error.message,
    stack: error.stack,
  });

  res.status(500).json({
    success: false,
    message: config.isProduction ? 'Internal server error' : error.message,
    code: 'INTERNAL_ERROR',
  });
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
    code: 'ROUTE_NOT_FOUND',
  });
}
