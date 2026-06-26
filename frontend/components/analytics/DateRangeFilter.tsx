'use client';

import type { AnalyticsRange } from '@/types/index';

const PRESETS: { id: Exclude<AnalyticsRange, 'custom'>; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: '7d', label: '7 Days' },
  { id: '30d', label: '30 Days' },
  { id: '90d', label: '90 Days' },
];

export function DateRangeFilter({
  range,
  from,
  to,
  onChange,
}: {
  range: AnalyticsRange;
  from: string;
  to: string;
  onChange: (next: { range: AnalyticsRange; from: string; to: string }) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {PRESETS.map((preset) => {
        const active = range === preset.id;
        return (
          <button
            key={preset.id}
            onClick={() => onChange({ range: preset.id, from, to })}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
              active
                ? 'border-primary/30 bg-primary/10 text-text-primary'
                : 'border-border bg-surface/50 text-text-secondary hover:text-text-primary'
            }`}
          >
            {preset.label}
          </button>
        );
      })}

      <button
        onClick={() => onChange({ range: 'custom', from, to })}
        className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
          range === 'custom'
            ? 'border-primary/30 bg-primary/10 text-text-primary'
            : 'border-border bg-surface/50 text-text-secondary hover:text-text-primary'
        }`}
      >
        Custom
      </button>

      {range === 'custom' && (
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={from}
            max={to || undefined}
            onChange={(e) => onChange({ range: 'custom', from: e.target.value, to })}
            className="rounded-lg border border-border bg-surface px-2 py-1.5 text-sm text-text-primary outline-none focus:border-primary/40"
          />
          <span className="text-text-secondary">to</span>
          <input
            type="date"
            value={to}
            min={from || undefined}
            onChange={(e) => onChange({ range: 'custom', from, to: e.target.value })}
            className="rounded-lg border border-border bg-surface px-2 py-1.5 text-sm text-text-primary outline-none focus:border-primary/40"
          />
        </div>
      )}
    </div>
  );
}
