'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Loader2, Bot } from 'lucide-react';
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton';
import { GlassCard } from '@/components/shared/GlassCard';
import { AnimatedBackground } from '@/components/shared/AnimatedBackground';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const [formData, setFormData] = useState({ email: '', password: '' });

  const { mutate: login, isPending } = useMutation({
    mutationFn: () => authApi.login(formData),
    onSuccess: (res) => {
      const { user, tokens } = res.data.data;
      setAuth(user, tokens.accessToken, tokens.refreshToken);
      toast.success('Welcome back!');
      router.push('/dashboard');
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message ?? 'Login failed. Please try again.');
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    login();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 relative overflow-hidden">
      <AnimatedBackground />
      
      {/* Ambient glows behind the card */}
      <div className="absolute left-1/2 top-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[120px]" />

      <div className="w-full max-w-md relative z-10">
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
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">Welcome back</h1>
            <p className="mt-1 text-sm text-text-secondary">Sign in to your ChatbotsHub dashboard</p>
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
                mode="login"
                onAuthenticated={({ user, tokens }) => {
                  setAuth(user, tokens.accessToken, tokens.refreshToken);
                  toast.success('Welcome back!');
                  router.push('/dashboard');
                }}
              />

              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs font-medium uppercase tracking-widest text-text-secondary">
                  or continue with email
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>
            </div>

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
                <div className="mb-2 flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium text-text-primary">
                    Password
                  </label>
                  <Link href="#" className="text-xs font-medium text-primary hover:text-primary-accent transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="input"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                  disabled={isPending}
                />
              </div>

              <button type="submit" className="btn-primary w-full !py-3 text-base mt-2" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-text-secondary">
              Don&apos;t have an account?{' '}
              <Link href="/auth/register" className="font-semibold text-primary hover:text-primary-accent transition-colors">
                Create one for free
              </Link>
            </p>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
