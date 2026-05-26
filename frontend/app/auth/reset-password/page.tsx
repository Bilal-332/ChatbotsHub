'use client';

import { useState, type FormEvent, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';
import { authApi } from '@/lib/api';
import { Loader2, Bot, Eye, EyeOff, KeyRound } from 'lucide-react';
import { GlassCard } from '@/components/shared/GlassCard';
import { AnimatedBackground } from '@/components/shared/AnimatedBackground';
import { motion } from 'framer-motion';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') ?? '';

  const [formData, setFormData] = useState({
    email: emailParam,
    code: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);

  const passwordMismatch = useMemo(() => {
    return Boolean(
      formData.password
      && formData.confirmPassword
      && formData.password !== formData.confirmPassword,
    );
  }, [formData.password, formData.confirmPassword]);

  const { mutate: resetPassword, isPending } = useMutation({
    mutationFn: () => authApi.resetPassword({
      email: formData.email.trim(),
      code: formData.code.trim(),
      password: formData.password,
    }),
    onSuccess: () => {
      toast.success('Password updated. Please sign in.');
      router.push('/auth/login');
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message ?? 'Unable to reset password.');
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (passwordMismatch) {
      toast.error('Passwords do not match.');
      return;
    }
    resetPassword();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 relative overflow-hidden">
      <AnimatedBackground />

      <div className="absolute right-0 bottom-0 -z-10 h-[420px] w-[420px] rounded-full bg-primary/15 blur-[120px] translate-x-1/3 translate-y-1/3" />

      <div className="w-full max-w-md relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex flex-col items-center gap-4"
        >
          <Link
            href="/"
            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20 border border-primary/30 shadow-glow-primary hover:scale-105 transition-transform"
          >
            <Bot className="h-8 w-8 text-primary" />
          </Link>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">Enter your reset code</h1>
            <p className="mt-1 text-sm text-text-secondary">
              Use the 6-digit code we emailed you and set a new password.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <GlassCard className="p-8 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-text-primary">
                  Email address
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
                <label htmlFor="code" className="mb-2 block text-sm font-medium text-text-primary">
                  Reset code
                </label>
                <div className="relative">
                  <input
                    id="code"
                    type="text"
                    inputMode="numeric"
                    pattern="\\d{6}"
                    required
                    className="input pr-10"
                    placeholder="123456"
                    value={formData.code}
                    onChange={(e) => setFormData((p) => ({ ...p, code: e.target.value }))}
                    disabled={isPending}
                    maxLength={6}
                  />
                  <KeyRound className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-text-primary">
                  New password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    className="input pr-12"
                    placeholder="Min. 8 chars, incl. uppercase & number"
                    value={formData.password}
                    onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                    disabled={isPending}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-2 flex items-center text-text-secondary hover:text-text-primary transition-colors"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    disabled={isPending}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-text-primary">
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  className="input"
                  placeholder="Re-enter your new password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData((p) => ({ ...p, confirmPassword: e.target.value }))}
                  disabled={isPending}
                />
                {passwordMismatch && (
                  <p className="mt-1 text-xs text-status-error">Passwords do not match.</p>
                )}
              </div>

              <button
                type="submit"
                className="btn-primary w-full !py-3 text-base"
                disabled={isPending || passwordMismatch}
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Updating password...
                  </>
                ) : (
                  'Update password'
                )}
              </button>
            </form>

            <p className="text-center text-sm text-text-secondary">
              Need a new code?{' '}
              <Link href="/auth/forgot-password" className="font-semibold text-primary hover:text-primary-accent transition-colors">
                Request another
              </Link>
            </p>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
