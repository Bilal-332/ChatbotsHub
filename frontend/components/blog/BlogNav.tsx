import Link from 'next/link';
import { LogoIcon } from '@/components/brand/Logo';

export function BlogNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3 group" aria-label="ChatbotsHub home">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/40 border border-primary/30 shadow-glow-primary transition-transform group-hover:scale-105 overflow-hidden">
            <LogoIcon size={36} className="h-9 w-9" />
          </div>
          <span className="font-logo text-lg font-bold tracking-tight text-text-primary">
            Chatbots<span className="text-primary">Hub</span>
          </span>
        </Link>

        <nav className="flex items-center gap-3 sm:gap-5">
          <Link
            href="/blog"
            className="hidden text-sm font-medium text-text-secondary transition-colors hover:text-text-primary sm:inline"
          >
            Blog
          </Link>
          <Link
            href="/#pricing"
            className="hidden text-sm font-medium text-text-secondary transition-colors hover:text-text-primary sm:inline"
          >
            Pricing
          </Link>
          <Link href="/auth/register" className="btn-primary !py-2 !px-5 text-sm">
            Get Started
          </Link>
        </nav>
      </div>
    </header>
  );
}
