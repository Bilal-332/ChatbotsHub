'use client';

import { useQuery } from '@tanstack/react-query';
import { organizationApi, documentApi } from '@lib/api';
import { FileText, MessageSquare, Zap, TrendingUp } from 'lucide-react';
import type { OrgStats, Paginated, Document } from '@appTypes/index';
import { PLAN_DISPLAY } from '@lib/constants';

const PLAN_LIMITS: Record<string, { maxDocuments: number; maxMonthlyQueries: number }> = {
  free: { maxDocuments: 3, maxMonthlyQueries: 200 },
  starter: { maxDocuments: 20, maxMonthlyQueries: 2000 },
  pro: { maxDocuments: 100, maxMonthlyQueries: 20000 },
};

function StatCard({
  label,
  value,
  max,
  icon: Icon,
  color,
}: {
  label: string;
  value: number | string;
  max?: number;
  icon: React.ElementType;
  color: string;
}) {
  const numValue = typeof value === 'number' ? value : 0;
  const percentage = max ? Math.round((numValue / max) * 100) : null;

  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {typeof value === 'number' ? value.toLocaleString() : value}
            {max && <span className="ml-1 text-base font-normal text-gray-400">/ {max.toLocaleString()}</span>}
          </p>
        </div>
        <div className={`rounded-xl p-3 ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
      {percentage !== null && (
        <div className="mt-4">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className={`h-1.5 rounded-full transition-all ${
                percentage >= 90 ? 'bg-red-500' : percentage >= 70 ? 'bg-yellow-500' : 'bg-primary-500'
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-gray-400">{percentage}% used</p>
        </div>
      )}
    </div>
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {orgData?.name ?? 'there'} 👋
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Here&apos;s an overview of your chatbot knowledge base.
        </p>
      </div>

      {/* Plan badge */}
      <div className="flex items-center gap-2">
        <span className="badge-blue capitalize">{plan} plan</span>
        {plan === 'free' && (
          <span className="text-xs text-gray-400">
            Upgrade for more documents and queries
          </span>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Documents"
          value={docsData?.total ?? 0}
          max={limits.maxDocuments}
          icon={FileText}
          color="bg-primary-600"
        />
        <StatCard
          label="Queries this month"
          value={statsData?.monthlyQueryCount ?? 0}
          max={limits.maxMonthlyQueries}
          icon={MessageSquare}
          color="bg-emerald-600"
        />
        <StatCard
          label="Plan"
          value={plan.toUpperCase()}
          icon={Zap}
          color="bg-amber-500"
        />
      </div>

      {/* Recent Documents */}
      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Recent Documents</h2>
          <a href="/dashboard/documents" className="text-sm font-medium text-primary-600 hover:text-primary-700">
            View all
          </a>
        </div>

        {!docsData?.items.length ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="mb-3 h-12 w-12 text-gray-300" />
            <p className="text-sm font-medium text-gray-700">No documents yet</p>
            <p className="mt-1 text-xs text-gray-400">
              Upload your first document to start building your knowledge base
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {docsData.items.map((doc) => (
              <div key={doc._id} className="flex items-center justify-between py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                    <FileText className="h-4 w-4 text-gray-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-800">{doc.title}</p>
                    <p className="text-xs uppercase text-gray-400">{doc.sourceType}</p>
                  </div>
                </div>
                <div className="ml-4 flex items-center gap-3">
                  {doc.chunkCount > 0 && (
                    <span className="text-xs text-gray-400">{doc.chunkCount} chunks</span>
                  )}
                  <DocumentStatusBadge status={doc.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
