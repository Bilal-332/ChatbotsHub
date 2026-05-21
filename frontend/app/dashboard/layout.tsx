'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Sidebar } from '@/components/layout/Sidebar';
import { AnimatedBackground } from '@/components/shared/AnimatedBackground';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-background text-text-primary overflow-hidden relative">
      <AnimatedBackground />
      <Sidebar />
      <main className="min-w-0 flex-1 overflow-auto relative z-10">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-12">{children}</div>
      </main>
    </div>
  );
}
