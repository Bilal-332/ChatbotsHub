import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function CTASection() {
  return (
    <section className="relative overflow-hidden bg-primary-600 py-28">
      {/* Background mesh */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.06) 0%, transparent 55%), radial-gradient(circle at 75% 30%, rgba(255,255,255,0.04) 0%, transparent 45%)',
        }}
      />
      {/* Grid lines */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-8 px-6 text-center">
        {/* Animated glow ring */}
        <div
          aria-hidden
          className="absolute left-1/2 top-1/2 -z-10 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-3xl"
        />

        <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          Start building AI chatbots<br className="hidden sm:block" /> in minutes
        </h2>

        <p className="max-w-lg text-lg text-primary-100">
          Upload your first document and have a working chatbot ready to query — completely free to start.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-base font-bold text-primary-700 shadow-lg shadow-primary-900/20 transition-all hover:bg-primary-50 hover:shadow-xl"
          >
            Create free account
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-7 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-all hover:border-white/60 hover:bg-white/10"
          >
            Sign in
          </Link>
        </div>

        <p className="text-sm text-primary-200">No credit card · Cancel anytime · Free tier forever</p>
      </div>
    </section>
  );
}
