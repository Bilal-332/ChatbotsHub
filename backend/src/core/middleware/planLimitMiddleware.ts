import { Request, Response, NextFunction } from 'express';
import { Organization } from '@modules/organizations/organization.model';
import { Document as DocumentModel } from '@modules/documents/document.model';
import { PlanLimitError, ForbiddenError } from '@shared/errors';
import type { AuthenticatedRequest } from '@shared/types';
import { PLAN_LIMITS } from '@modules/plans/plan.constants';

/**
 * Check if the organization has reached its document upload limit.
 */
export async function checkDocumentLimit(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const { organizationId } = (req as AuthenticatedRequest).user;

  const org = await Organization.findById(organizationId).select('plan').lean();
  if (!org) throw new ForbiddenError('Organization not found');

  const limits = PLAN_LIMITS[org.plan];
  const docCount = await DocumentModel.countDocuments({
    organizationId,
    status: { $ne: 'failed' },
  });

  if (docCount >= limits.maxDocuments) {
    throw new PlanLimitError(
      `Document limit reached (${limits.maxDocuments} max on ${org.plan} plan). Please upgrade.`,
    );
  }

  next();
}

/**
 * Check if the organization can crawl another website. Website sources count as
 * documents, so this enforces the document cap and attaches the plan's
 * per-crawl page limit to the request for the crawler to honor.
 */
export async function checkCrawlLimit(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const { organizationId } = (req as AuthenticatedRequest).user;

  const org = await Organization.findById(organizationId).select('plan').lean();
  if (!org) throw new ForbiddenError('Organization not found');

  const limits = PLAN_LIMITS[org.plan];
  const docCount = await DocumentModel.countDocuments({
    organizationId,
    status: { $ne: 'failed' },
  });

  if (docCount >= limits.maxDocuments) {
    throw new PlanLimitError(
      `Knowledge source limit reached (${limits.maxDocuments} max on ${org.plan} plan). Please upgrade.`,
    );
  }

  (req as Request & { crawlPageLimit?: number }).crawlPageLimit = limits.maxCrawlPages;

  next();
}

/**
 * Check and increment monthly query count before allowing a chat query.
 */
export async function checkQueryLimit(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const organizationId =
    (req as AuthenticatedRequest).user?.organizationId ??
    (req as unknown as { organizationId: string }).organizationId;

  const org = await Organization.findById(organizationId)
    .select('plan monthlyQueryCount queryResetAt')
    .lean();

  if (!org) throw new ForbiddenError('Organization not found');

  const limits = PLAN_LIMITS[org.plan];

  // Reset monthly counter if it's a new month
  const now = new Date();
  const resetAt = org.queryResetAt ? new Date(org.queryResetAt) : new Date(0);

  if (now.getMonth() !== resetAt.getMonth() || now.getFullYear() !== resetAt.getFullYear()) {
    await Organization.findByIdAndUpdate(organizationId, {
      monthlyQueryCount: 0,
      queryResetAt: now,
    });
  } else if (org.monthlyQueryCount >= limits.maxMonthlyQueries) {
    throw new PlanLimitError(
      `Monthly query limit reached (${limits.maxMonthlyQueries} queries on ${org.plan} plan). Limit resets next month.`,
    );
  }

  // Increment counter atomically
  await Organization.findByIdAndUpdate(organizationId, {
    $inc: { monthlyQueryCount: 1 },
  });

  next();
}
