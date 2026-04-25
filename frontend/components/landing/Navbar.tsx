'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bot, Menu, X } from 'lucide-react';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'border-b border-gray-100 bg-white/90 shadow-sm backdrop-blur-md'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5" aria-label="ChatbotsHub home">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-600 shadow-md">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900">
            Chatbots<span className="text-primary-600">Hub</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-7 md:flex">
          <a
            href="#how-it-works"
            className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
          >
            How it works
          </a>
          <a
            href="#features"
            className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
          >
            Features
          </a>
        </div>

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-3 md:flex">
          <Link href="/auth/login" className="btn-secondary !py-2 !px-4 text-sm">
            Sign in
          </Link>
          <Link href="/auth/register" className="btn-primary !py-2 !px-4 text-sm">
            Get started free
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 md:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-gray-100 bg-white px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            <a href="#how-it-works" className="text-sm font-medium text-gray-700" onClick={() => setMenuOpen(false)}>
              How it works
            </a>
            <a href="#features" className="text-sm font-medium text-gray-700" onClick={() => setMenuOpen(false)}>
              Features
            </a>
            <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
              <Link href="/auth/login" className="btn-secondary w-full justify-center text-sm">
                Sign in
              </Link>
              <Link href="/auth/register" className="btn-primary w-full justify-center text-sm">
                Get started free
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
