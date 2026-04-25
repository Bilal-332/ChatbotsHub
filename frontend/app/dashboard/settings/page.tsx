'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';
import { organizationApi } from '@lib/api';
import type { Organization } from '@appTypes/index';
import { Copy, RefreshCw, Loader2, Check } from 'lucide-react';

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="rounded p-1.5 text-gray-400 hover:text-gray-700"
      title="Copy"
    >
      {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
    </button>
  );
}

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [embedCopied, setEmbedCopied] = useState(false);

  const { data: org, isLoading } = useQuery<Organization>({
    queryKey: ['organization'],
    queryFn: () => organizationApi.get().then((r) => r.data.data),
  });

  const [formData, setFormData] = useState({
    chatbotName: '',
    welcomeMessage: '',
    primaryColor: '#6366f1',
  });

  const [initialized, setInitialized] = useState(false);
  if (org && !initialized) {
    setFormData({
      chatbotName: org.settings.chatbotName,
      welcomeMessage: org.settings.welcomeMessage,
      primaryColor: org.settings.primaryColor,
    });
    setInitialized(true);
  }

  const { mutate: updateSettings, isPending: isSaving } = useMutation({
    mutationFn: () =>
      organizationApi.update({ settings: formData }),
    onSuccess: () => {
      toast.success('Settings saved');
      queryClient.invalidateQueries({ queryKey: ['organization'] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message ?? 'Failed to save settings');
    },
  });

  const { mutate: regenerateKey, isPending: isRegenerating } = useMutation({
    mutationFn: () => organizationApi.regenerateApiKey(),
    onSuccess: () => {
      toast.success('API key regenerated');
      queryClient.invalidateQueries({ queryKey: ['organization'] });
    },
    onError: () => toast.error('Failed to regenerate API key'),
  });

  const widgetScript = org
    ? `<script src="${process.env.NEXT_PUBLIC_WIDGET_URL ?? 'https://yourdomain.com'}/widget.js"\n        data-api-key="${org.apiKey}">\n</script>`
    : '';

  const copyEmbed = async () => {
    await navigator.clipboard.writeText(widgetScript);
    setEmbedCopied(true);
    setTimeout(() => setEmbedCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your organization and chatbot settings.</p>
      </div>

      {/* Chatbot Customization */}
      <div className="card space-y-5">
        <h2 className="text-base font-semibold text-gray-900">Chatbot Customization</h2>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Chatbot name</label>
          <input
            type="text"
            className="input max-w-sm"
            value={formData.chatbotName}
            onChange={(e) => setFormData((p) => ({ ...p, chatbotName: e.target.value }))}
            maxLength={50}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Welcome message</label>
          <textarea
            className="input max-w-lg resize-none"
            rows={3}
            value={formData.welcomeMessage}
            onChange={(e) => setFormData((p) => ({ ...p, welcomeMessage: e.target.value }))}
            maxLength={200}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Primary color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              className="h-10 w-16 cursor-pointer rounded border border-gray-300 p-1"
              value={formData.primaryColor}
              onChange={(e) => setFormData((p) => ({ ...p, primaryColor: e.target.value }))}
            />
            <span className="text-sm text-gray-500">{formData.primaryColor}</span>
          </div>
        </div>

        <button className="btn-primary" onClick={() => updateSettings()} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save changes'
          )}
        </button>
      </div>

      {/* API Key */}
      <div className="card space-y-4">
        <h2 className="text-base font-semibold text-gray-900">API Key</h2>
        <p className="text-sm text-gray-500">
          Use this key in the widget embed code. Keep it confidential.
        </p>

        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
          <code className="flex-1 truncate text-sm font-mono text-gray-800">{org?.apiKey}</code>
          <CopyButton value={org?.apiKey ?? ''} />
        </div>

        <button
          className="btn-secondary text-sm"
          onClick={() => {
            if (confirm('Regenerate API key? The old key will stop working immediately.')) {
              regenerateKey();
            }
          }}
          disabled={isRegenerating}
        >
          {isRegenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Regenerating...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Regenerate key
            </>
          )}
        </button>
      </div>

      {/* Embed Widget */}
      <div className="card space-y-4">
        <h2 className="text-base font-semibold text-gray-900">Embed Widget</h2>
        <p className="text-sm text-gray-500">
          Add this snippet before the closing <code className="font-mono text-xs">&lt;/body&gt;</code> tag on your website.
        </p>

        <div className="relative">
          <pre className="overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-green-400">
            <code>{widgetScript}</code>
          </pre>
          <button
            onClick={copyEmbed}
            className="absolute right-3 top-3 rounded-md bg-gray-700 p-1.5 text-gray-300 hover:text-white"
          >
            {embedCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
