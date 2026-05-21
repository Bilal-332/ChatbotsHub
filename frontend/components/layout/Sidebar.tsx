'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bot, LayoutDashboard, FileText, Settings, LogOut, Menu, X, Code2 } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Knowledge Base', href: '/dashboard/documents', icon: FileText },
  //{ name: 'API & Integration', href: '/dashboard/api', icon: Code2 },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    router.push('/auth/login');
  };

  const navContent = (
    <div className="flex h-full flex-col bg-surface/50 backdrop-blur-xl border-r border-border">
      {/* Logo */}
      <div className="flex h-[72px] items-center gap-3 border-b border-border px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 border border-primary/30 shadow-glow-primary">
          <Bot className="h-5 w-5 text-primary" />
        </div>
        <span className="text-xl font-bold tracking-tight text-text-primary">
          Chatbots<span className="text-primary">Hub</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 px-4 py-6">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="relative group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all"
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-pill"
                  className="absolute inset-0 rounded-xl bg-primary/10 border border-primary/20"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full shadow-glow-primary" />
              )}
              <item.icon className={`h-5 w-5 shrink-0 z-10 transition-colors ${isActive ? 'text-primary' : 'text-text-secondary group-hover:text-text-primary'}`} />
              <span className={`z-10 transition-colors ${isActive ? 'text-text-primary font-semibold' : 'text-text-secondary group-hover:text-text-primary'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-border p-4">
        <div className="mb-4 flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border text-sm font-semibold text-text-primary shadow-sm">
            {user?.email?.charAt(0).toUpperCase() ?? 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-text-primary">{user?.email}</p>
            <p className="text-[11px] uppercase tracking-wider text-text-secondary mt-0.5">{user?.role || 'Admin'}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-text-secondary transition-all hover:bg-status-danger/10 hover:text-status-danger hover:border-status-danger/20 border border-transparent"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-72 shrink-0 lg:flex lg:flex-col">
        {navContent}
      </aside>

      {/* Mobile toggle */}
      <button
        className="fixed left-4 top-4 z-[60] rounded-lg bg-surface/80 backdrop-blur-md p-2 text-text-primary lg:hidden border border-border shadow-sm"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle sidebar"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="fixed inset-y-0 left-0 z-50 w-72 lg:hidden shadow-2xl"
          >
            {navContent}
          </motion.aside>
        </>
      )}
    </>
  );
}
