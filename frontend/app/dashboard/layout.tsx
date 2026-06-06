'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Sidebar } from '@/components/layout/Sidebar';
import { AnimatedBackground } from '@/components/shared/AnimatedBackground';
import { PlanExpiryBanner } from '@/components/shared/PlanExpiryBanner';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, impersonation, stopImpersonation } = useAuthStore();

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
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-12">
          {impersonation && (
            <div className="mb-6 rounded-2xl border border-status-warning/30 bg-status-warning/10 px-4 py-3 text-sm text-text-primary flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold">Impersonation active</p>
                <p className="text-xs text-text-secondary">You're viewing this workspace as a super admin.</p>
              </div>
              <button
                className="btn-secondary !px-4 !py-2"
                onClick={() => {
                  stopImpersonation();
                  router.push('/dashboard/admin/organizations');
                }}
              >
                Exit Access
              </button>
            </div>
          )}
          <PlanExpiryBanner />
          {children}
        </div>
      </main>
    </div>
  );
}
