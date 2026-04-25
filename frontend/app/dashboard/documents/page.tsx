'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { documentApi } from '@lib/api';
import type { Paginated, Document } from '@appTypes/index';
import { DocumentCard } from '@components/documents/DocumentCard';
import { DocumentUpload } from '@components/documents/DocumentUpload';
import { Plus, FileText, Loader2 } from 'lucide-react';

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="mt-1 text-sm text-gray-500">
            Upload documents to train your AI knowledge base.
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => setShowUpload(true)}
        >
          <Plus className="h-4 w-4" />
          Upload Document
        </button>
      </div>

      {/* Upload modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Upload Document</h2>
            <DocumentUpload onClose={() => setShowUpload(false)} />
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Failed to load documents. Please refresh the page.
        </div>
      )}

      {/* Empty state */}
      {!isLoading && data?.items.length === 0 && (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <FileText className="mb-4 h-16 w-16 text-gray-200" />
          <h3 className="text-base font-semibold text-gray-700">No documents yet</h3>
          <p className="mt-2 max-w-sm text-sm text-gray-400">
            Upload a PDF, DOCX, or TXT file to begin building your AI knowledge base.
          </p>
          <button
            className="btn-primary mt-6"
            onClick={() => setShowUpload(true)}
          >
            <Plus className="h-4 w-4" />
            Upload your first document
          </button>
        </div>
      )}

      {/* Document list */}
      {data && data.items.length > 0 && (
        <div className="space-y-3">
          {data.items.map((doc) => (
            <DocumentCard key={doc._id} doc={doc} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            className="btn-secondary"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </button>
          <span className="text-sm text-gray-500">
            Page {page} of {data.totalPages}
          </span>
          <button
            className="btn-secondary"
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
