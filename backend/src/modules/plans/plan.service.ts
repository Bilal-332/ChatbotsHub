import { Organization } from '@modules/organizations/organization.model';
import type { PlanName } from '@shared/types';
import { logger } from '@shared/logger';

const PAID_PLANS: PlanName[] = ['starter', 'pro'];
const PLAN_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface PlanExpiryWarning {
  expiredPlan: PlanName;
  expiredAt: string;
  message: string;
}

export function isPaidPlan(plan: PlanName): boolean {
  return PAID_PLANS.includes(plan);
}

export function getPlanExpiryDate(from: Date = new Date()): Date {
  return new Date(from.getTime() + PLAN_DURATION_MS);
}

/**
 * Read-only: return expiry warning only for orgs downgraded from a paid plan.
 * Always-free workspaces (no expiredPlan) never receive a warning.
 */
export async function getPlanExpiryWarning(
  organizationId: string,
): Promise<PlanExpiryWarning | null> {
  const org = await Organization.findById(organizationId)
    .select('plan expiredPlan planExpiredAt')
    .lean();

  if (!org || org.plan !== 'free') return null;
  if (!org.expiredPlan || !isPaidPlan(org.expiredPlan)) return null;

  return buildExpiryWarning(org.expiredPlan, org.planExpiredAt ?? new Date());
}

/**
 * Downgrade a single organization if its paid plan has expired.
 * Returns warning only when the org had a paid plan that lapsed — not for always-free orgs.
 */
export async function checkAndApplyPlanExpiry(
  organizationId: string,
): Promise<PlanExpiryWarning | null> {
  const org = await Organization.findById(organizationId)
    .select('plan planExpiresAt expiredPlan planExpiredAt')
    .lean();

  if (!org) return null;

  const now = new Date();

  // Paid plan still active
  if (isPaidPlan(org.plan) && org.planExpiresAt && org.planExpiresAt > now) {
    return null;
  }

  // Paid plan expired — downgrade to free and record which paid plan lapsed
  if (isPaidPlan(org.plan) && org.planExpiresAt && org.planExpiresAt <= now) {
    const expiredPlan = org.plan;
    await Organization.findByIdAndUpdate(organizationId, {
      plan: 'free',
      expiredPlan,
      planExpiresAt: null,
      planExpiredAt: org.planExpiresAt,
    });

    logger.info(`Plan expired for org ${organizationId}: ${expiredPlan} → free`);

    return buildExpiryWarning(expiredPlan, org.planExpiresAt);
  }

  return getPlanExpiryWarning(organizationId);
}

function buildExpiryWarning(expiredPlan: PlanName, expiredAt: Date): PlanExpiryWarning {
  const planLabel = expiredPlan.charAt(0).toUpperCase() + expiredPlan.slice(1);
  return {
    expiredPlan,
    expiredAt: expiredAt.toISOString(),
    message: `Your ${planLabel} plan for this month has expired. Your workspace has been moved to the Free plan. Please contact us to renew.`,
  };
}

/**
 * Apply paid plan with 30-day expiry. Clears previous expiry warning.
 */
export async function assignPaidPlan(
  organizationId: string,
  plan: PlanName,
): Promise<void> {
  if (!isPaidPlan(plan)) {
    await Organization.findByIdAndUpdate(organizationId, {
      plan,
      planExpiresAt: null,
      expiredPlan: null,
      planExpiredAt: null,
    });
    return;
  }

  await Organization.findByIdAndUpdate(organizationId, {
    plan,
    planExpiresAt: getPlanExpiryDate(),
    expiredPlan: null,
    planExpiredAt: null,
  });
}

/**
 * Batch job: downgrade all organizations with expired paid plans.
 */
export async function processAllExpiredPlans(): Promise<number> {
  const now = new Date();
  const expiredOrgs = await Organization.find({
    plan: { $in: PAID_PLANS },
    planExpiresAt: { $lte: now },
  }).select('_id plan planExpiresAt');

  let count = 0;
  for (const org of expiredOrgs) {
    await Organization.findByIdAndUpdate(org._id, {
      plan: 'free',
      expiredPlan: org.plan,
      planExpiresAt: null,
      planExpiredAt: org.planExpiresAt ?? now,
    });
    count += 1;
  }

  if (count > 0) {
    logger.info(`Processed ${count} expired plan(s)`);
  }

  return count;
}

export function startPlanExpiryScheduler(intervalMs = 60 * 60 * 1000): NodeJS.Timeout {
  void processAllExpiredPlans();
  return setInterval(() => {
    void processAllExpiredPlans();
  }, intervalMs);
}
