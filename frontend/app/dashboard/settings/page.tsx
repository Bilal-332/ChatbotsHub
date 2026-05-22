'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';
import { organizationApi } from '@/lib/api';
import type { Organization } from '@/types/index';
import { Loader2, Palette } from 'lucide-react';
import { GlassCard } from '@/components/shared/GlassCard';
import { motion } from 'framer-motion';

export default function SettingsPage() {
  const queryClient = useQueryClient();

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
        <p className="mt-2 text-sm text-text-secondary">Configure your AI agent appearance and greeting.</p>
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

    </div>
  );
}
