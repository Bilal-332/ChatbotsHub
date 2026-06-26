'use client';

import type { LucideIcon } from 'lucide-react';
import { GlassCard } from '@/components/shared/GlassCard';

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
}) {
  return (
    <GlassCard className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wider text-text-secondary">{label}</p>
        <p className="mt-2 text-2xl font-bold text-text-primary">{value}</p>
        {hint && <p className="mt-1 text-xs text-text-secondary">{hint}</p>}
      </div>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
        <Icon className="h-5 w-5 text-primary" />
      </div>
    </GlassCard>
  );
}
