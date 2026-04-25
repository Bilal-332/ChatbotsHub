'use client';

import { useState, type FormEvent, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';
import { authApi } from '@lib/api';
import { useAuthStore } from '@store/authStore';
import { Loader2, Bot } from 'lucide-react';

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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 shadow-lg">
            <Bot className="h-8 w-8 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
            <p className="mt-1 text-sm text-gray-500">Free plan. No credit card required.</p>
          </div>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="org-name" className="mb-1.5 block text-sm font-medium text-gray-700">
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
              <label htmlFor="slug" className="mb-1.5 block text-sm font-medium text-gray-700">
                Workspace URL
              </label>
              <div className="flex rounded-lg border border-gray-300 shadow-sm focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500">
                <span className="flex items-center rounded-l-lg border-r border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
                  chatbotshub.me/
                </span>
                <input
                  id="slug"
                  type="text"
                  required
                  className="min-w-0 flex-1 rounded-r-lg px-3 py-2.5 text-sm focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-50"
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
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
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
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700">
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

            <button type="submit" className="btn-primary w-full" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create free account'
              )}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-medium text-primary-600 hover:text-primary-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
