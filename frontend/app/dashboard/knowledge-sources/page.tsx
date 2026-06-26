'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { documentApi } from '@/lib/api';
import type { Paginated, Document } from '@/types/index';
import { DocumentCard } from '@/components/documents/DocumentCard';
import { AddUrlModal } from '@/components/knowledge/AddUrlModal';
import { Plus, Database, Globe, FileText, Loader2 } from 'lucide-react';
import { GlassCard } from '@/components/shared/GlassCard';
import { motion } from 'framer-motion';

type SourceFilter = 'all' | 'files' | 'websites';

export default function KnowledgeSourcesPage() {
  const [page, setPage] = useState(1);
  const [showAddUrl, setShowAddUrl] = useState(false);
  const [filter, setFilter] = useState<SourceFilter>('all');

  const { data, isLoading, isError } = useQuery<Paginated<Document>>({
    queryKey: ['documents', page],
    queryFn: () => documentApi.list(page).then((r) => r.data.data),
    refetchInterval: (query) => {
      const hasProcessing = query.state.data?.items.some(
        (d) => d.status === 'processing' || d.status === 'pending',
      );
      return hasProcessing ? 3000 : false;
    },
  });

  const filteredItems = useMemo(() => {
    const items = data?.items ?? [];
    if (filter === 'files') return items.filter((d) => d.sourceType !== 'url');
    if (filter === 'websites') return items.filter((d) => d.sourceType === 'url');
    return items;
  }, [data?.items, filter]);

  const filters: { id: SourceFilter; label: string; icon: typeof Database }[] = [
    { id: 'all', label: 'All Sources', icon: Database },
    { id: 'files', label: 'Documents', icon: FileText },
    { id: 'websites', label: 'Websites', icon: Globe },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">Knowledge Sources</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Manage every source that powers your AI — uploaded documents and trained websites.
          </p>
        </div>
        <button className="btn-primary !px-5" onClick={() => setShowAddUrl(true)}>
          <Plus className="h-4 w-4" />
          Add Website URL
        </button>
      </motion.div>

      {/* Source filter tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {filters.map((f) => {
          const active = filter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? 'border-primary/30 bg-primary/10 text-text-primary'
                  : 'border-border bg-surface/50 text-text-secondary hover:text-text-primary'
              }`}
            >
              <f.icon className="h-4 w-4" />
              {f.label}
            </button>
          );
        })}
      </div>

      {showAddUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg rounded-2xl bg-surface border border-border p-6 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <h2 className="mb-6 text-xl font-bold text-text-primary">Add Website URL</h2>
            <AddUrlModal onClose={() => setShowAddUrl(false)} />
          </motion.div>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-status-danger/20 bg-status-danger/5 p-4 text-sm text-status-danger flex items-center gap-2">
          Failed to load knowledge sources. Please refresh the page.
        </div>
      )}

      {!isLoading && filteredItems.length === 0 && (
        <GlassCard className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-surface border border-border shadow-inner mb-6">
            <Database className="h-10 w-10 text-text-secondary/50" />
          </div>
          <h3 className="text-lg font-bold text-text-primary">
            {filter === 'websites' ? 'No websites trained yet' : 'No knowledge sources yet'}
          </h3>
          <p className="mt-2 max-w-sm text-sm text-text-secondary">
            Add a website URL to crawl, or upload documents from the Knowledge Base tab.
          </p>
          <button className="btn-primary mt-8" onClick={() => setShowAddUrl(true)}>
            <Plus className="h-4 w-4" />
            Add your first website
          </button>
        </GlassCard>
      )}

      {filteredItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-4"
        >
          {filteredItems.map((doc) => (
            <DocumentCard key={doc._id} doc={doc} />
          ))}
        </motion.div>
      )}

      {data && data.totalPages > 1 && filter === 'all' && (
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
