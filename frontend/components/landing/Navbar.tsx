'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogoIcon } from '@/components/brand/Logo';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${scrolled
          ? 'border-b border-border bg-background/50 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.1)]'
          : 'bg-transparent'
        }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3 group" aria-label="ChatbotsHub home">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/40 border border-primary/30 shadow-glow-primary transition-transform group-hover:scale-105 overflow-hidden">
            <LogoIcon size={40} className="h-10 w-10" />
          </div>
          <span className="font-logo text-xl font-bold tracking-tight text-text-primary">
            Chatbots<span className="text-primary">Hub</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-8 md:flex">
          <a
            href="#how-it-works"
            className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
          >
            Platform
          </a>
          <a
            href="#features"
            className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
          >
            Capabilities
          </a>
          <a
            href="#pricing"
            className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
          >
            Pricing
          </a>
          <a
            href="#contact"
            className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
          >
            Contact
          </a>
          <a
            href="/blog"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
          >
            Blog
          </a>
          <a
            href="#dashboard-preview"
            className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
          >
            Enterprise
          </a>
        </div>

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-4 md:flex">
          <Link href="/auth/login" className="text-sm font-medium text-text-primary hover:text-primary transition-colors">
            Sign In
          </Link>
          <Link href="/auth/register" className="btn-primary !py-2 !px-5 text-sm">
            Get Started
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="rounded-lg p-2 text-text-secondary hover:bg-surface md:hidden transition-colors"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-border bg-surface/90 backdrop-blur-xl px-6 py-4 md:hidden overflow-hidden"
          >
            <div className="flex flex-col gap-4">
              <a href="#features" className="text-sm font-medium text-text-primary" onClick={() => setMenuOpen(false)}>
                Capabilities
              </a>
              <a href="#pricing" className="text-sm font-medium text-text-primary" onClick={() => setMenuOpen(false)}>
                Pricing
              </a>
              <a href="#contact" className="text-sm font-medium text-text-primary" onClick={() => setMenuOpen(false)}>
                Contact
              </a>
              <a
                href="/blog"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-text-primary"
                onClick={() => setMenuOpen(false)}
              >
                Blog
              </a>
              <a href="#dashboard-preview" className="text-sm font-medium text-text-primary" onClick={() => setMenuOpen(false)}>
                Enterprise
              </a>
              <div className="flex flex-col gap-3 pt-4 border-t border-border">
                <Link href="/auth/login" className="btn-secondary w-full justify-center text-sm">
                  Sign In
                </Link>
                <Link href="/auth/register" className="btn-primary w-full justify-center text-sm">
                  Get Started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
