'use client';

import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { organizationApi } from '@/lib/api';
import type { Organization, PlanName } from '@/types/index';
import { CONTACT_INFO } from '@/lib/constants';

const EXPIRED_PAID_PLANS: PlanName[] = ['starter', 'pro'];

function shouldShowExpiryBanner(org: Organization | undefined): boolean {
  if (!org) return false;
  // Only orgs currently on free that previously had a paid plan
  if (org.plan !== 'free') return false;
  if (!org.expiredPlan || !EXPIRED_PAID_PLANS.includes(org.expiredPlan)) return false;
  return Boolean(org.planExpiryWarning);
}

export function PlanExpiryBanner() {
  const { data: org, isLoading } = useQuery<Organization>({
    queryKey: ['organization'],
    queryFn: () => organizationApi.get().then((r) => r.data.data),
  });

  if (isLoading || !shouldShowExpiryBanner(org)) return null;

  const warning = org!.planExpiryWarning!;

  return (
    <div className="mb-6 rounded-2xl border border-status-warning/30 bg-status-warning/10 px-4 py-4 text-sm text-text-primary">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-status-warning" />
          <div>
            <p className="font-semibold">Plan expired</p>
            <p className="mt-1 text-text-secondary">{warning.message}</p>
          </div>
        </div>
        <Link
          href={`mailto:${CONTACT_INFO.email}?subject=Plan%20Renewal%20-%20ChatbotsHub`}
          className="btn-secondary !px-4 !py-2 shrink-0 text-xs sm:text-sm"
        >
          Contact to Renew
        </Link>
      </div>
    </div>
  );
}
