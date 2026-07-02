import { Request, Response, NextFunction } from 'express';
import { Organization } from '@modules/organizations/organization.model';
import { Document as DocumentModel } from '@modules/documents/document.model';
import { PlanLimitError, ForbiddenError } from '@shared/errors';
import type { AuthenticatedRequest } from '@shared/types';
import { PLAN_LIMITS } from '@modules/plans/plan.constants';
import { checkAndApplyPlanExpiry } from '@modules/plans/plan.service';

// Rolling usage window aligned with the 30-day plan duration (L4).
const QUERY_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

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

  // L3: expired paid plans are only downgraded by the hourly scheduler / dashboard
  // reads, so the widget query path could keep serving paid limits after expiry.
  // Enforce expiry here so the correct (downgraded) plan limits apply immediately.
  await checkAndApplyPlanExpiry(organizationId);

  const org = await Organization.findById(organizationId)
    .select('plan monthlyQueryCount queryResetAt')
    .lean();

  if (!org) throw new ForbiddenError('Organization not found');

  const limits = PLAN_LIMITS[org.plan];

  // L4: reset the usage counter on a rolling 30-day window aligned with the plan
  // duration, rather than at the calendar-month boundary.
  const now = new Date();
  const resetAt = org.queryResetAt ? new Date(org.queryResetAt) : new Date(0);

  if (now.getTime() - resetAt.getTime() >= QUERY_WINDOW_MS) {
    // New window: this request counts as the first of the window.
    await Organization.findByIdAndUpdate(organizationId, {
      monthlyQueryCount: 1,
      queryResetAt: now,
    });
    next();
    return;
  }

  // L2: atomic conditional increment — the increment only applies while the org is
  // still under its cap, so concurrent requests cannot race past the limit.
  const updated = await Organization.findOneAndUpdate(
    { _id: organizationId, monthlyQueryCount: { $lt: limits.maxMonthlyQueries } },
    { $inc: { monthlyQueryCount: 1 } },
  );

  if (!updated) {
    throw new PlanLimitError(
      `Monthly query limit reached (${limits.maxMonthlyQueries} queries on ${org.plan} plan). Limit resets next month.`,
    );
  }

  next();
}
