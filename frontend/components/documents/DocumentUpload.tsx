'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { isAxiosError } from 'axios';
import { documentApi, organizationApi } from '@lib/api';
import { uploadToCloudinary } from '@lib/uploadToCloudinary';
import { PRICING_PLANS } from '@lib/constants';
import type { Organization } from '@appTypes/index';
import { Upload, FileText, X, Loader2 } from 'lucide-react';

const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'text/plain': ['.txt'],
};

const FREE_MAX_SIZE_MB =
  PRICING_PLANS.find((p) => p.id === 'free')?.features.maxFileSizeMb ?? 5;

export function DocumentUpload({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Plan-based upload limit (Free 5MB, Starter 10MB, Pro 25MB). Reuses the
  // cached org query; defaults to the restrictive Free limit until loaded.
  const { data: org } = useQuery<Organization>({
    queryKey: ['organization'],
    queryFn: () => organizationApi.get().then((r) => r.data.data),
  });
  const MAX_SIZE_MB =
    PRICING_PLANS.find((p) => p.id === org?.plan)?.features.maxFileSizeMb ?? FREE_MAX_SIZE_MB;

  const { mutate: upload, isPending } = useMutation({
    mutationFn: async (file: File) => {
      const fileUrl = await uploadToCloudinary(file);
      return documentApi.upload({
        fileUrl,
        originalName: file.name,
      });
    },
    onSuccess: () => {
      toast.success('Document uploaded! Processing in background...');
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      onClose();
    },
    onError: (error: unknown) => {
      const message = isAxiosError<{ message: string }>(error)
        ? error.response?.data?.message
        : error instanceof Error
          ? error.message
          : undefined;

      toast.error(message ?? 'Upload failed. Please try again.');
    },
  });

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) setSelectedFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_SIZE_MB * 1024 * 1024,
    maxFiles: 1,
    disabled: isPending,
  });

  const handleUpload = () => {
    if (selectedFile) upload(selectedFile);
  };

  const rejectionMessage = fileRejections[0]?.errors[0]?.message;

  return (
    <div className="space-y-4">
      {/* Instructions */}
      <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
        <h3 className="mb-2 font-semibold">How to format your documents for best AI results:</h3>
        <ul className="list-inside list-disc space-y-1">
          <li><strong>Clear Paragraphs:</strong> Separate text paragraphs with a blank line. Avoid giant blocks of text.</li>
          <li><strong>Short Headings:</strong> Use clear, title-cased headings without trailing punctuation (e.g., &quot;Employee Benefits&quot;).</li>
          <li><strong>Supported Formats:</strong> Upload standard or scanned PDF, DOCX, or TXT files.</li>
          <li><strong>Keep it Clean:</strong> Try to remove overly complex tables or formatting that isn&apos;t relevant text.</li>
        </ul>
      </div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
          isDragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
        } ${isPending ? 'cursor-not-allowed opacity-60' : ''}`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto mb-3 h-10 w-10 text-gray-400" />
        <p className="text-sm font-medium text-gray-700">
          {isDragActive ? 'Drop your file here' : 'Drag & drop a file, or click to browse'}
        </p>
        <p className="mt-1 text-xs text-gray-400">PDF, DOCX, TXT — max {MAX_SIZE_MB}MB</p>
      </div>

      {/* Rejection error */}
      {rejectionMessage && (
        <p className="text-xs text-red-600">{rejectionMessage}</p>
      )}

      {/* Selected file preview */}
      {selectedFile && (
        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-primary-500" />
            <div>
              <p className="text-sm font-medium text-gray-800">{selectedFile.name}</p>
              <p className="text-xs text-gray-400">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          {!isPending && (
            <button
              onClick={() => setSelectedFile(null)}
              className="rounded p-1 text-gray-400 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <button className="btn-secondary" onClick={onClose} disabled={isPending}>
          Cancel
        </button>
        <button
          className="btn-primary"
          onClick={handleUpload}
          disabled={!selectedFile || isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Upload
            </>
          )}
        </button>
      </div>
    </div>
  );
}
