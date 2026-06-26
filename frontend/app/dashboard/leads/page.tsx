'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';
import { leadApi } from '@/lib/api';
import type { Lead, LeadStatus, Paginated } from '@/types/index';
import { UserPlus, Download, Loader2, Mail, Phone } from 'lucide-react';
import { GlassCard } from '@/components/shared/GlassCard';
import { motion } from 'framer-motion';

const STATUS_OPTIONS: LeadStatus[] = ['new', 'contacted', 'qualified', 'closed'];

const STATUS_BADGE: Record<LeadStatus, string> = {
  new: 'badge-blue',
  contacted: 'badge-yellow',
  qualified: 'badge-green',
  closed: 'badge-gray',
};

function StatusSelect({ lead }: { lead: Lead }) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (status: LeadStatus) => leadApi.updateStatus(lead._id, status),
    onSuccess: () => {
      toast.success('Lead status updated');
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message ?? 'Failed to update status');
    },
  });

  return (
    <div className="flex items-center gap-2">
      <span className={STATUS_BADGE[lead.status]}>{lead.status}</span>
      <select
        value={lead.status}
        disabled={isPending}
        onChange={(e) => mutate(e.target.value as LeadStatus)}
        className="rounded-lg border border-border bg-surface px-2 py-1 text-xs text-text-primary outline-none focus:border-primary/40"
        aria-label="Update lead status"
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function LeadsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [exporting, setExporting] = useState(false);

  const { data, isLoading, isError } = useQuery<Paginated<Lead>>({
    queryKey: ['leads', page, statusFilter],
    queryFn: () =>
      leadApi
        .list({ page, status: statusFilter === 'all' ? undefined : statusFilter })
        .then((r) => r.data.data),
  });

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await leadApi.exportCsv(statusFilter === 'all' ? undefined : statusFilter);
      const blob = new Blob([res.data as BlobPart], { type: 'text/csv;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Leads exported');
    } catch {
      toast.error('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="space-y-6 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">Leads</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Conversations your chatbot converted into business leads.
          </p>
        </div>
        <button
          className="btn-secondary !px-5"
          onClick={handleExport}
          disabled={exporting || !data || data.total === 0}
        >
          {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Export CSV
        </button>
      </motion.div>

      {/* Status filter */}
      <div className="flex flex-wrap items-center gap-2">
        {(['all', ...STATUS_OPTIONS] as const).map((s) => {
          const active = statusFilter === s;
          return (
            <button
              key={s}
              onClick={() => {
                setStatusFilter(s);
                setPage(1);
              }}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                active
                  ? 'border-primary/30 bg-primary/10 text-text-primary'
                  : 'border-border bg-surface/50 text-text-secondary hover:text-text-primary'
              }`}
            >
              {s}
            </button>
          );
        })}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-status-danger/20 bg-status-danger/5 p-4 text-sm text-status-danger">
          Failed to load leads. Please refresh the page.
        </div>
      )}

      {!isLoading && data?.items.length === 0 && (
        <GlassCard className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-surface border border-border shadow-inner mb-6">
            <UserPlus className="h-10 w-10 text-text-secondary/50" />
          </div>
          <h3 className="text-lg font-bold text-text-primary">No leads yet</h3>
          <p className="mt-2 max-w-sm text-sm text-text-secondary">
            When visitors share their details in your chatbot, they will appear here.
          </p>
        </GlassCard>
      )}

      {data && data.items.length > 0 && (
        <GlassCard className="overflow-hidden !p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wider text-text-secondary">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Contact</th>
                  <th className="px-4 py-3 font-medium">Source Bot</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((lead) => (
                  <tr key={lead._id} className="border-b border-border/50 last:border-0 hover:bg-surface/40">
                    <td className="px-4 py-3">
                      <div className="font-medium text-text-primary">{lead.name}</div>
                      {lead.company && (
                        <div className="text-xs text-text-secondary">{lead.company}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={`mailto:${lead.email}`}
                        className="flex items-center gap-1.5 text-text-secondary hover:text-primary"
                      >
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{lead.email}</span>
                      </a>
                      {lead.phone && (
                        <a
                          href={`tel:${lead.phone}`}
                          className="mt-1 flex items-center gap-1.5 text-text-secondary hover:text-primary"
                        >
                          <Phone className="h-3.5 w-3.5 shrink-0" />
                          {lead.phone}
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{lead.sourceBot}</td>
                    <td className="px-4 py-3 text-text-secondary">{formatDate(lead.createdAt)}</td>
                    <td className="px-4 py-3">
                      <StatusSelect lead={lead} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-6 border-t border-border mt-8">
          <button
            className="btn-secondary !px-4"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </button>
          <span className="text-sm font-medium text-text-secondary">
            Page {page} of {data.totalPages}
          </span>
          <button
            className="btn-secondary !px-4"
            disabled={page === data.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
