'use client';

import { useQuery } from '@tanstack/react-query';
import { organizationApi, documentApi } from '@/lib/api';
import { FileText, MessageSquare, Zap, TrendingUp, Search, CalendarClock } from 'lucide-react';
import type { OrgStats, Paginated, Document } from '@/types/index';
import { PLAN_DISPLAY } from '@/lib/constants';
import { GlassCard } from '@/components/shared/GlassCard';
import { motion } from 'framer-motion';
import Link from 'next/link';

const PLAN_LIMITS: Record<string, { maxDocuments: number; maxMonthlyQueries: number }> = {
  free: { maxDocuments: 3, maxMonthlyQueries: 100 },
  starter: { maxDocuments: 10, maxMonthlyQueries: 1000 },
  pro: { maxDocuments: 20, maxMonthlyQueries: 10000 },
};

function StatCard({
  label,
  value,
  max,
  icon: Icon,
  color,
  delay = 0,
}: {
  label: string;
  value: number | string;
  max?: number;
  icon: React.ElementType;
  color: string;
  delay?: number;
}) {
  const numValue = typeof value === 'number' ? value : 0;
  const percentage = max ? Math.round((numValue / max) * 100) : null;

  return (
    <GlassCard 
      animated 
      motionProps={{
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, delay }
      }}
      className="p-6"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-text-secondary uppercase tracking-wider">{label}</p>
          <p className="mt-2 text-3xl font-bold text-text-primary">
            {typeof value === 'number' ? value.toLocaleString() : value}
            {max && <span className="ml-1 text-lg font-normal text-text-secondary">/ {max.toLocaleString()}</span>}
          </p>
        </div>
        <div className={`rounded-xl p-3 bg-surface border border-border ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      {percentage !== null && (
        <div className="mt-6">
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface border border-border/50">
            <div
              className={`h-2 rounded-full transition-all ${
                percentage >= 90 ? 'bg-status-danger' : percentage >= 70 ? 'bg-status-warning' : 'bg-primary'
              } shadow-[0_0_10px_rgba(var(--color-primary),0.5)]`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          <p className="mt-2 text-xs font-medium text-text-secondary text-right">{percentage}% used</p>
        </div>
      )}
    </GlassCard>
  );
}

function DocumentStatusBadge({ status }: { status: Document['status'] }) {
  const map = {
    ready: 'badge-green',
    processing: 'badge-yellow',
    pending: 'badge-gray',
    failed: 'badge-red',
  } as const;
  return <span className={map[status]}>{status}</span>;
}

export default function DashboardPage() {
  const { data: orgData } = useQuery({
    queryKey: ['organization'],
    queryFn: () => organizationApi.get().then((r) => r.data.data),
  });

  const { data: statsData } = useQuery({
    queryKey: ['org-stats'],
    queryFn: () => organizationApi.getStats().then((r) => r.data.data),
  });

  const { data: docsData } = useQuery<Paginated<Document>>({
    queryKey: ['documents', 1],
    queryFn: () => documentApi.list(1, 5).then((r) => r.data.data),
  });

  const plan = statsData?.plan ?? 'free';
  const limits = PLAN_LIMITS[plan] ?? PLAN_LIMITS['free'];

  const isPaidPlan = plan === 'starter' || plan === 'pro';
  const expiresAt = orgData?.planExpiresAt ?? null;
  const daysLeft = expiresAt
    ? Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86400000))
    : null;
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const expiry = isPaidPlan
    ? expiresAt
      ? {
          label: `Plan expires ${formatDate(expiresAt)}`,
          hint: `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`,
          urgent: (daysLeft ?? 0) <= 7,
        }
      : { label: 'Lifetime plan', hint: 'Never expires', urgent: false }
    : { label: 'Free plan', hint: 'No expiry date', urgent: false };

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight text-text-primary">
              Welcome back, {orgData?.name ?? 'there'}
            </h1>
            <span className="badge-blue capitalize border-primary/20 bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-xs font-semibold">{plan}</span>
          </div>
          <p className="text-base text-text-secondary">
            Here's what's happening with your AI knowledge base today.
          </p>
          <div
            className={`mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
              expiry.urgent
                ? 'border-status-warning/30 bg-status-warning/10 text-status-warning'
                : 'border-border bg-surface/60 text-text-secondary'
            }`}
          >
            <CalendarClock className="h-3.5 w-3.5" />
            <span>{expiry.label}</span>
            <span className="text-text-secondary/60">•</span>
            <span className="font-medium">{expiry.hint}</span>
          </div>
        </div>
        <Link href="/dashboard/documents" className="btn-primary !px-5 !py-2.5 text-sm whitespace-nowrap self-start md:self-auto">
  + New Knowledge
</Link>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Knowledge Base"
          value={docsData?.total ?? 0}
          max={limits.maxDocuments}
          icon={FileText}
          color="text-primary"
          delay={0.1}
        />
        <StatCard
          label="API Requests (MTD)"
          value={statsData?.monthlyQueryCount ?? 0}
          max={limits.maxMonthlyQueries}
          icon={MessageSquare}
          color="text-emerald-400"
          delay={0.2}
        />
        <StatCard
          label="Current Tier"
          value={plan.toUpperCase()}
          icon={Zap}
          color="text-[#7C4DFF]"
          delay={0.3}
        />
      </div>

      {/* Recent Documents */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <GlassCard className="p-0 overflow-hidden">
          <div className="flex items-center justify-between border-b border-border bg-surface/50 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Search className="h-4 w-4" />
              </div>
              <h2 className="text-lg font-bold text-text-primary">Recent Knowledge Base Updates</h2>
            </div>
            <a href="/dashboard/documents" className="text-sm font-semibold text-primary hover:text-primary-accent transition-colors">
              View all
            </a>
          </div>

          {!docsData?.items.length ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface border border-border shadow-inner mb-4">
                <FileText className="h-8 w-8 text-text-secondary/50" />
              </div>
              <p className="text-base font-bold text-text-primary">No knowledge synced yet</p>
              <p className="mt-2 text-sm text-text-secondary max-w-sm mx-auto">
                Upload your first document or connect an integration to start building your AI agent's brain.
              </p>
              <button className="btn-secondary mt-6 text-sm">Upload Document</button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {docsData.items.map((doc) => (
                <div key={doc._id} className="flex items-center justify-between px-6 py-4 hover:bg-surface/50 transition-colors group cursor-pointer">
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface border border-border group-hover:border-primary/30 transition-colors">
                      <FileText className="h-5 w-5 text-text-secondary group-hover:text-primary transition-colors" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-text-primary group-hover:text-primary transition-colors">{doc.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-[10px] font-bold tracking-wider uppercase text-text-secondary">{doc.sourceType}</p>
                        {/* <span className="text-text-secondary/30">•</span>
                        <p className="text-xs text-text-secondary">Added just now</p> */}
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 flex items-center gap-4">
                    {doc.chunkCount > 0 && (
                      <span className="text-xs font-medium text-text-secondary hidden sm:inline-block">{doc.chunkCount} vector chunks</span>
                    )}
                    <DocumentStatusBadge status={doc.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
}
