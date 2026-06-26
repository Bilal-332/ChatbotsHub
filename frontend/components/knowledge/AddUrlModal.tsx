'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { isAxiosError } from 'axios';
import { documentApi } from '@lib/api';
import { Globe, Loader2 } from 'lucide-react';

export function AddUrlModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [url, setUrl] = useState('');

  const { mutate: train, isPending } = useMutation({
    mutationFn: () => documentApi.trainUrl({ url: url.trim() }),
    onSuccess: () => {
      toast.success('Website training started! Crawling in the background...');
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      onClose();
    },
    onError: (error: unknown) => {
      const message = isAxiosError<{ message: string }>(error)
        ? error.response?.data?.message
        : error instanceof Error
          ? error.message
          : undefined;
      toast.error(message ?? 'Failed to start website training. Please try again.');
    },
  });

  const isValid = (() => {
    const trimmed = url.trim();
    if (!trimmed) return false;
    try {
      const parsed = new URL(trimmed);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  })();

  const handleSubmit = () => {
    if (isValid && !isPending) train();
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
        <h3 className="mb-2 font-semibold">Train your chatbot from a website</h3>
        <ul className="list-inside list-disc space-y-1">
          <li>We crawl the site, extract clean text, and index it into your knowledge base.</li>
          <li>Only public pages on the same domain are crawled (up to your plan limit).</li>
          <li>Private networks and internal addresses are blocked for security.</li>
        </ul>
      </div>

      <div>
        <label htmlFor="website-url" className="mb-1.5 block text-sm font-medium text-text-primary">
          Website URL
        </label>
        <div className="relative">
          <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <input
            id="website-url"
            type="url"
            inputMode="url"
            autoFocus
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit();
            }}
            placeholder="https://example.com"
            disabled={isPending}
            className="input !pl-9"
          />
        </div>
        <p className="mt-1 text-xs text-text-secondary">
          Include the full address, starting with http:// or https://
        </p>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button className="btn-secondary" onClick={onClose} disabled={isPending}>
          Cancel
        </button>
        <button className="btn-primary" onClick={handleSubmit} disabled={!isValid || isPending}>
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Starting...
            </>
          ) : (
            <>
              <Globe className="h-4 w-4" />
              Start Training
            </>
          )}
        </button>
      </div>
    </div>
  );
}
