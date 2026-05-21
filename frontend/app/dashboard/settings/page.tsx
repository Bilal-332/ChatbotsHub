'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';
import { organizationApi } from '@/lib/api';
import type { Organization } from '@/types/index';
import { Copy, RefreshCw, Loader2, Check, Settings, Terminal, Shield, Palette } from 'lucide-react';
import { GlassCard } from '@/components/shared/GlassCard';
import { motion } from 'framer-motion';

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
      className="rounded-lg p-2 text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
      title="Copy to clipboard"
    >
      {copied ? <Check className="h-4 w-4 text-status-success" /> : <Copy className="h-4 w-4" />}
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
    primaryColor: '#5B6CFF', // Default to new PRIMARY
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
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold tracking-tight text-text-primary">Workspace Settings</h1>
        <p className="mt-2 text-sm text-text-secondary">Configure your AI agent and manage integration keys.</p>
      </motion.div>

      {/* Chatbot Customization */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <GlassCard className="space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
              <Palette className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">Agent Appearance</h2>
              <p className="text-sm text-text-secondary">Customize how your AI agent looks to users.</p>
            </div>
          </div>

          <div className="space-y-5 pt-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-text-primary">Agent Name</label>
              <input
                type="text"
                className="input max-w-sm"
                value={formData.chatbotName}
                onChange={(e) => setFormData((p) => ({ ...p, chatbotName: e.target.value }))}
                maxLength={50}
                placeholder="e.g. Acme Support Bot"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-text-primary">Welcome Message</label>
              <textarea
                className="input max-w-xl resize-none"
                rows={3}
                value={formData.welcomeMessage}
                onChange={(e) => setFormData((p) => ({ ...p, welcomeMessage: e.target.value }))}
                maxLength={200}
                placeholder="Hi there! How can I help you today?"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-text-primary">Brand Color</label>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <input
                    type="color"
                    className="h-10 w-20 cursor-pointer rounded-lg border border-border bg-card p-1"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData((p) => ({ ...p, primaryColor: e.target.value }))}
                  />
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-surface">
                  <span className="w-4 h-4 rounded-full" style={{ backgroundColor: formData.primaryColor }}></span>
                  <span className="text-sm font-mono text-text-secondary uppercase">{formData.primaryColor}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <button className="btn-primary" onClick={() => updateSettings()} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* API Key */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <GlassCard className="space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-status-warning/10 border border-status-warning/20">
              <Shield className="h-5 w-5 text-status-warning" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">API Credentials</h2>
              <p className="text-sm text-text-secondary">
                Use this key to authenticate REST API requests and widget embeds.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <div className="flex items-center gap-3 rounded-xl border border-border bg-surface/50 px-4 py-3 shadow-inner">
              <code className="flex-1 truncate text-sm font-mono text-primary">{org?.apiKey}</code>
              <CopyButton value={org?.apiKey ?? ''} />
            </div>

            <button
              className="btn-secondary mt-6"
              onClick={() => {
                if (confirm('Regenerate API key? The old key will stop working immediately and you will need to update all integrations.')) {
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
                  Roll API Key
                </>
              )}
            </button>
          </div>
        </GlassCard>
      </motion.div>

      {/* Integration Code */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <GlassCard className="space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7C4DFF]/10 border border-[#7C4DFF]/20">
              <Terminal className="h-5 w-5 text-[#7C4DFF]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">Widget Integration</h2>
              <p className="text-sm text-text-secondary">
                Add this code to your application to embed the chat interface.
              </p>
            </div>
          </div>

          <div className="space-y-6 pt-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-text-primary">HTML Snippet</label>
              <div className="relative group">
                <pre className="overflow-x-auto rounded-xl border border-border bg-[#0b0f19] p-5 text-sm shadow-inner">
                  <code className="text-emerald-400 font-mono leading-relaxed">{widgetScript}</code>
                </pre>
                <button
                  onClick={copyEmbed}
                  className="absolute right-3 top-3 rounded-lg bg-surface/80 backdrop-blur-sm border border-border p-2 text-text-secondary opacity-0 group-hover:opacity-100 transition-all hover:text-text-primary"
                  title="Copy code"
                >
                  {embedCopied ? <Check className="h-4 w-4 text-status-success" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <p className="mt-3 text-xs text-text-secondary">
                Paste this snippet right before the closing <code className="rounded bg-surface px-1.5 py-0.5 text-primary border border-border">&lt;/body&gt;</code> tag on your website.
              </p>
            </div>

            <div className="pt-4 border-t border-border">
              <label className="mb-2 block text-sm font-semibold text-text-primary">Direct Testing Link</label>
              <div className="flex items-center gap-3 rounded-xl border border-border bg-surface/50 px-4 py-3 shadow-inner">
                <a
                  href={`${process.env.NEXT_PUBLIC_WIDGET_URL ?? (typeof window !== 'undefined' ? window.location.origin : 'https://yourdomain.com')}/chat?apiKey=${org?.apiKey}&color=${encodeURIComponent(org?.settings?.primaryColor ?? formData.primaryColor)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 truncate text-sm text-primary hover:text-primary-accent hover:underline transition-colors font-medium"
                >
                  {`${process.env.NEXT_PUBLIC_WIDGET_URL ?? (typeof window !== 'undefined' ? window.location.origin : 'https://yourdomain.com')}/chat?apiKey=${org?.apiKey}`}
                </a>
                <CopyButton value={`${process.env.NEXT_PUBLIC_WIDGET_URL ?? (typeof window !== 'undefined' ? window.location.origin : 'https://yourdomain.com')}/chat?apiKey=${org?.apiKey}&color=${encodeURIComponent(org?.settings?.primaryColor ?? formData.primaryColor)}`} />
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
