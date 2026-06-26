'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';
import { documentApi } from '@lib/api';
import type { Document } from '@appTypes/index';
import { FileText, Globe, Trash2, RefreshCw, Loader2, AlertCircle, ExternalLink } from 'lucide-react';

function StatusBadge({ status }: { status: Document['status'] }) {
  const map: Record<Document['status'], { cls: string; label: string }> = {
    ready: { cls: 'badge-green', label: 'Ready' },
    processing: { cls: 'badge-yellow', label: 'Processing' },
    pending: { cls: 'badge-gray', label: 'Pending' },
    failed: { cls: 'badge-red', label: 'Failed' },
  };
  const { cls, label } = map[status];
  return <span className={cls}>{label}</span>;
}

export function DocumentCard({ doc }: { doc: Document }) {
  const queryClient = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { mutate: deleteDoc, isPending: isDeleting } = useMutation({
    mutationFn: () => documentApi.delete(doc._id),
    onSuccess: () => {
      toast.success('Document deleted');
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message ?? 'Delete failed');
    },
  });

  const { mutate: reprocess, isPending: isReprocessing } = useMutation({
    mutationFn: () => documentApi.reprocess(doc._id),
    onSuccess: () => {
      toast.success('Reprocessing started');
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message ?? 'Reprocess failed');
    },
  });

  const createdDate = new Date(doc.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const isWebsite = doc.sourceType === 'url';

  return (
    <div className="card flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50">
          {isWebsite ? (
            <Globe className="h-5 w-5 text-primary-600" />
          ) : (
            <FileText className="h-5 w-5 text-primary-600" />
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate font-medium text-white">{doc.title}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
            <span className="uppercase">{isWebsite ? 'Website' : doc.sourceType}</span>
            <span>•</span>
            <span>{createdDate}</span>
            {isWebsite && typeof doc.pagesCrawled === 'number' && doc.pagesCrawled > 0 && (
              <>
                <span>•</span>
                <span>{doc.pagesCrawled} pages crawled</span>
              </>
            )}
            {doc.chunkCount > 0 && (
              <>
                <span>•</span>
                <span>{doc.chunkCount} chunks indexed</span>
              </>
            )}
          </div>
          {isWebsite && doc.sourceUrl && (
            <a
              href={doc.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex max-w-full items-center gap-1 truncate text-xs text-primary-400 hover:text-primary-300"
            >
              <ExternalLink className="h-3 w-3 shrink-0" />
              <span className="truncate">{doc.sourceUrl}</span>
            </a>
          )}
          {doc.status === 'failed' && doc.processingError && (
            <div className="mt-2 flex items-start gap-1.5 text-xs text-red-600">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{doc.processingError}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <StatusBadge status={doc.status} />

        {doc.status === 'failed' && (
          <button
            className="btn-secondary py-1.5 text-xs"
            onClick={() => reprocess()}
            disabled={isReprocessing}
            title="Retry processing"
          >
            {isReprocessing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
          </button>
        )}

        {!confirmDelete ? (
          <button
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
            onClick={() => setConfirmDelete(true)}
            disabled={isDeleting}
            title="Delete document"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        ) : (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500">Delete?</span>
            <button
              className="btn-danger py-1 text-xs"
              onClick={() => deleteDoc()}
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Yes'}
            </button>
            <button
              className="btn-secondary py-1 text-xs"
              onClick={() => setConfirmDelete(false)}
            >
              No
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
