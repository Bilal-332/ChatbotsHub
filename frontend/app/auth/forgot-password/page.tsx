'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';
import { authApi } from '@/lib/api';
import { Loader2, Bot, MailCheck } from 'lucide-react';
import { GlassCard } from '@/components/shared/GlassCard';
import { AnimatedBackground } from '@/components/shared/AnimatedBackground';
import { motion } from 'framer-motion';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  const { mutate: requestReset, isPending } = useMutation({
    mutationFn: () => authApi.forgotPassword(email.trim()),
    onSuccess: () => {
      toast.success('If an account exists, a reset code has been sent.');
      const encoded = encodeURIComponent(email.trim());
      router.push(`/auth/reset-password?email=${encoded}`);
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message ?? 'Unable to send reset code.');
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    requestReset();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 relative overflow-hidden">
      <AnimatedBackground />

      <div className="absolute left-0 top-0 -z-10 h-[420px] w-[420px] rounded-full bg-primary/15 blur-[120px] -translate-x-1/3 -translate-y-1/3" />

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
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">Reset your password</h1>
            <p className="mt-1 text-sm text-text-secondary">
              We will email you a one-time code to reset your password.
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
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="input pr-10"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isPending}
                  />
                  <MailCheck className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
                </div>
              </div>

              <button type="submit" className="btn-primary w-full !py-3 text-base" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Sending code...
                  </>
                ) : (
                  'Send reset code'
                )}
              </button>
            </form>

            <p className="text-center text-sm text-text-secondary">
              Remembered your password?{' '}
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
