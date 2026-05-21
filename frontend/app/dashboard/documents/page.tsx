'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { documentApi } from '@/lib/api';
import type { Paginated, Document } from '@/types/index';
import { DocumentCard } from '@/components/documents/DocumentCard';
import { DocumentUpload } from '@/components/documents/DocumentUpload';
import { Plus, FileText, Loader2 } from 'lucide-react';
import { GlassCard } from '@/components/shared/GlassCard';
import { motion } from 'framer-motion';

export default function DocumentsPage() {
  const [page, setPage] = useState(1);
  const [showUpload, setShowUpload] = useState(false);

  const { data, isLoading, isError } = useQuery<Paginated<Document>>({
    queryKey: ['documents', page],
    queryFn: () => documentApi.list(page).then((r) => r.data.data),
    refetchInterval: (query) => {
      // Auto-refresh while any docs are processing
      const hasProcessing = query.state.data?.items.some(
        (d) => d.status === 'processing' || d.status === 'pending',
      );
      return hasProcessing ? 3000 : false;
    },
  });

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">Knowledge Base</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Upload and manage the documents that power your AI agents.
          </p>
        </div>
        <button
          className="btn-primary !px-5"
          onClick={() => setShowUpload(true)}
        >
          <Plus className="h-4 w-4" />
          Add Document
        </button>
      </motion.div>

      {/* Upload modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-lg rounded-2xl bg-surface border border-border p-6 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <h2 className="mb-6 text-xl font-bold text-text-primary">Upload Document</h2>
            <DocumentUpload onClose={() => setShowUpload(false)} />
          </motion.div>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="rounded-xl border border-status-danger/20 bg-status-danger/5 p-4 text-sm text-status-danger flex items-center gap-2">
          Failed to load knowledge base. Please refresh the page.
        </div>
      )}

      {/* Empty state */}
      {!isLoading && data?.items.length === 0 && (
        <GlassCard className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-surface border border-border shadow-inner mb-6">
            <FileText className="h-10 w-10 text-text-secondary/50" />
          </div>
          <h3 className="text-lg font-bold text-text-primary">Your knowledge base is empty</h3>
          <p className="mt-2 max-w-sm text-sm text-text-secondary">
            Upload a PDF, Word document, or plain text file to start building your AI's brain.
          </p>
          <button
            className="btn-primary mt-8"
            onClick={() => setShowUpload(true)}
          >
            <Plus className="h-4 w-4" />
            Upload first document
          </button>
        </GlassCard>
      )}

      {/* Document list */}
      {data && data.items.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-4"
        >
          {data.items.map((doc) => (
            <DocumentCard key={doc._id} doc={doc} />
          ))}
        </motion.div>
      )}

      {/* Pagination */}
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
