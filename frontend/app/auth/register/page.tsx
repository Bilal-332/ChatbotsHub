'use client';

import { useState, type FormEvent, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Loader2, Bot, Sparkles } from 'lucide-react';
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton';
import { GlassCard } from '@/components/shared/GlassCard';
import { AnimatedBackground } from '@/components/shared/AnimatedBackground';
import { motion } from 'framer-motion';

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60);
}

interface FormData {
  email: string;
  password: string;
  organizationName: string;
  organizationSlug: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    organizationName: '',
    organizationSlug: '',
  });

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const handleOrgNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData((p) => ({
      ...p,
      organizationName: name,
      organizationSlug: slugManuallyEdited ? p.organizationSlug : slugify(name),
    }));
  };

  const { mutate: register, isPending, error } = useMutation({
    mutationFn: () => authApi.register(formData),
    onSuccess: (res) => {
      const { user, tokens } = res.data.data;
      setAuth(user, tokens.accessToken, tokens.refreshToken);
      toast.success('Account created! Welcome to ChatbotsHub.');
      router.push('/dashboard');
    },
    onError: (err: AxiosError<{ message: string }>) => {
      toast.error(err.response?.data?.message ?? 'Registration failed. Please try again.');
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    register();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 relative overflow-hidden">
      <AnimatedBackground />

      {/* Ambient glows behind the card */}
      <div className="absolute right-0 top-0 -z-10 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[120px] translate-x-1/3 -translate-y-1/3" />
      <div className="absolute left-0 bottom-0 -z-10 h-[400px] w-[400px] rounded-full bg-primary-accent/10 blur-[100px] -translate-x-1/3 translate-y-1/3" />

      <div className="w-full max-w-[480px] relative z-10">
        {/* Logo */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex flex-col items-center gap-4"
        >
          <Link href="/" className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20 border border-primary/30 shadow-glow-primary hover:scale-105 transition-transform">
            <Bot className="h-8 w-8 text-primary" />
          </Link>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">Create your workspace</h1>
            <p className="mt-2 text-sm text-text-secondary flex items-center justify-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Free forever. No credit card required.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <GlassCard className="p-8 space-y-6">
            <div className="space-y-4">
              <GoogleAuthButton
                mode="register"
                organizationName={formData.organizationName}
                organizationSlug={formData.organizationSlug}
                disabled={!formData.organizationName || !formData.organizationSlug}
                onAuthenticated={({ user, tokens }) => {
                  setAuth(user, tokens.accessToken, tokens.refreshToken);
                  toast.success('Account created! Welcome to ChatbotsHub.');
                  router.push('/dashboard');
                }}
              />

              {(!formData.organizationName || !formData.organizationSlug) && (
                <p className="text-center text-xs text-status-warning bg-status-warning/10 border border-status-warning/20 rounded-lg p-2">
                  Enter your organization details below before continuing with Google.
                </p>
              )}

              <div className="flex items-center gap-3 py-2">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs font-medium uppercase tracking-widest text-text-secondary">
                  or sign up with email
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div>
                <label htmlFor="org-name" className="mb-2 block text-sm font-medium text-text-primary">
                  Organization name
                </label>
                <input
                  id="org-name"
                  type="text"
                  required
                  className="input"
                  placeholder="Acme Corp"
                  value={formData.organizationName}
                  onChange={handleOrgNameChange}
                  disabled={isPending}
                />
              </div>

              <div>
                <label htmlFor="slug" className="mb-2 block text-sm font-medium text-text-primary">
                  Workspace URL
                </label>
                <div className="flex rounded-lg border border-border shadow-inner focus-within:border-primary focus-within:ring-1 focus-within:ring-primary overflow-hidden transition-all group">
                  <span className="flex items-center border-r border-border bg-surface px-3 text-sm text-text-secondary">
                    chatbotshub.me/
                  </span>
                  <input
                    id="slug"
                    type="text"
                    required
                    className="min-w-0 flex-1 bg-card px-3 py-2.5 text-sm text-text-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 placeholder:text-text-secondary/50"
                    placeholder="acme-corp"
                    value={formData.organizationSlug}
                    onChange={(e) => {
                      setSlugManuallyEdited(true);
                      setFormData((p) => ({ ...p, organizationSlug: slugify(e.target.value) }));
                    }}
                    disabled={isPending}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-text-primary">
                  Work email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="input"
                  placeholder="you@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                  disabled={isPending}
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-text-primary">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="input"
                  placeholder="Min. 8 chars, incl. uppercase & number"
                  value={formData.password}
                  onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                  disabled={isPending}
                />
              </div>

              <button type="submit" className="btn-primary w-full !py-3 text-base mt-2" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Creating account...
                  </>
                ) : (
                  'Create Free Account'
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-text-secondary">
              Already have an account?{' '}
              <Link href="/auth/login" className="font-semibold text-primary hover:text-primary-accent transition-colors">
                Sign in
              </Link>
            </p>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
