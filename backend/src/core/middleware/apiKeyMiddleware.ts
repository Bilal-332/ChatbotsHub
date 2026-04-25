import { Request, Response, NextFunction } from 'express';
import { Organization } from '@modules/organizations/organization.model';
import { UnauthorizedError } from '@shared/errors';
import type { ApiKeyRequest } from '@shared/types';

/**
 * Validate the x-api-key header and attach organizationId to the request.
 * Used by the public chatbot widget endpoint.
 */
export async function validateApiKey(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const apiKey = req.headers['x-api-key'] as string | undefined;

  if (!apiKey) {
    throw new UnauthorizedError('API key required');
  }

  const organization = await Organization.findOne({ apiKey, isActive: true })
    .select('_id')
    .lean();

  if (!organization) {
    throw new UnauthorizedError('Invalid or inactive API key');
  }

  (req as ApiKeyRequest).organizationId = organization._id.toString();
  next();
}
