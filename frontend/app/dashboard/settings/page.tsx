'use client';

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';
import { organizationApi } from '@/lib/api';
import type { Organization, SupportedLanguage } from '@/types/index';
import { Loader2, Palette, Upload, Bot, Globe } from 'lucide-react';
import { GlassCard } from '@/components/shared/GlassCard';
import { motion } from 'framer-motion';
import { getBackendAssetUrl, resolveAvatarUrl } from '@/lib/utils';
import { LANGUAGE_OPTIONS } from '@/lib/constants';

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: org, isLoading } = useQuery<Organization>({
    queryKey: ['organization'],
    queryFn: () => organizationApi.get().then((r) => r.data.data),
  });

  const [formData, setFormData] = useState({
    chatbotName: '',
    welcomeMessage: '',
    noAnswerMessage: '',
    primaryColor: '#5B6CFF',
    language: 'auto' as SupportedLanguage,
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  if (org && !initialized) {
    setFormData({
      chatbotName: org.settings.chatbotName,
      welcomeMessage: org.settings.welcomeMessage,
      noAnswerMessage: org.settings.noAnswerMessage,
      primaryColor: org.settings.primaryColor,
      language: org.settings.language ?? 'auto',
    });
    if (org.settings.avatarUrl) {
      setAvatarPreview(resolveAvatarUrl(org.settings.avatarUrl) ?? '');
    }
    setInitialized(true);
  }

  const { mutate: updateSettings, isPending: isSaving } = useMutation({
    mutationFn: () => organizationApi.update({ settings: formData }),
    onSuccess: () => {
      toast.success('Settings saved');
      queryClient.invalidateQueries({ queryKey: ['organization'] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message ?? 'Failed to save settings');
    },
  });

  const { mutate: uploadAvatar, isPending: isUploading } = useMutation({
    mutationFn: (file: File) => organizationApi.uploadAvatar(file),
    onSuccess: (res) => {
      const avatarUrl = res.data.data.avatarUrl;
      setAvatarPreview(resolveAvatarUrl(avatarUrl) ?? '');
      toast.success('Avatar uploaded');
      queryClient.invalidateQueries({ queryKey: ['organization'] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message ?? 'Failed to upload avatar');
    },
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2 MB');
      return;
    }

    setAvatarPreview(URL.createObjectURL(file));
    uploadAvatar(file);
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
        <p className="mt-2 text-sm text-text-secondary">
          Configure your AI agent appearance, avatar, and language preferences.
        </p>
      </motion.div>

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
            {/* Avatar upload */}
            <div>
              <label className="mb-3 block text-sm font-semibold text-text-primary">Agent Avatar</label>
              <div className="flex items-center gap-6">
                <div
                  className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-border bg-surface"
                  style={{ backgroundColor: formData.primaryColor + '20' }}
                >
                  {avatarPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Bot className="h-8 w-8 text-primary" />
                  )}
                  {(isUploading) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <Loader2 className="h-5 w-5 animate-spin text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={handleAvatarChange}
                    disabled={isUploading}
                  />
                  <button
                    type="button"
                    className="btn-secondary !py-2 !px-4 text-sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    <Upload className="h-4 w-4" />
                    {isUploading ? 'Uploading...' : 'Upload Avatar'}
                  </button>
                  <p className="mt-2 text-xs text-text-secondary">JPG, PNG, WebP or GIF. Max 2 MB.</p>
                </div>
              </div>
            </div>

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
              <label className="mb-2 block text-sm font-semibold text-text-primary">No-Answer Message</label>
              <textarea
                className="input max-w-xl resize-none"
                rows={3}
                value={formData.noAnswerMessage}
                onChange={(e) => setFormData((p) => ({ ...p, noAnswerMessage: e.target.value }))}
                maxLength={300}
                placeholder="Sorry, I do not have that information yet."
              />
              <p className="mt-1 text-xs text-text-secondary">
                Shown when the assistant cannot find an answer in your documents.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-text-primary">Brand Color</label>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  className="h-10 w-20 cursor-pointer rounded-lg border border-border bg-card p-1"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData((p) => ({ ...p, primaryColor: e.target.value }))}
                />
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-surface">
                  <span className="w-4 h-4 rounded-full" style={{ backgroundColor: formData.primaryColor }} />
                  <span className="text-sm font-mono text-text-secondary uppercase">{formData.primaryColor}</span>
                </div>
              </div>
            </div>

            {/* Language */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-text-primary">
                <Globe className="h-4 w-4" />
                Response Language
              </label>
              <select
                className="input max-w-sm"
                value={formData.language}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, language: e.target.value as SupportedLanguage }))
                }
              >
                {LANGUAGE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-text-secondary">
                Auto-detect responds in the same language as the user&apos;s question (English, Arabic, Urdu).
              </p>
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
