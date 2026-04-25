import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ValidationError } from '@shared/errors';

export function validateRequest(req: Request, _res: Response, next: NextFunction): void {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    const errors: Record<string, string[]> = {};

    result.array().forEach((error) => {
      const field = error.type === 'field' ? error.path : 'general';
      if (!errors[field]) {
        errors[field] = [];
      }
      errors[field].push(error.msg as string);
    });

    throw new ValidationError(errors);
  }

  next();
}
