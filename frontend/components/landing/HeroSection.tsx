import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

const HeroScene = dynamic(() => import('@components/scenes/HeroScene'), {
  ssr: false,
  loading: () => <div className="h-full w-full" />,
});

export function HeroSection() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-white pt-16">
      {/* Ambient glow blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-primary-50 opacity-70 blur-3xl" />
        <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-primary-100 opacity-40 blur-3xl" />
      </div>

      <div className="relative mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-6 py-24 lg:grid-cols-2">
        {/* ── Left: Copy ─────────────────────────────────── */}
        <div className="flex flex-col">
          {/* Badge */}
          <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-3.5 py-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary-600" />
            <span className="text-xs font-semibold text-primary-700 tracking-wide">AI-Powered Document Intelligence</span>
          </div>

          <h1 className="text-[3.25rem] font-extrabold leading-[1.08] tracking-tight text-gray-900 sm:text-[3.75rem]">
            Turn your<br />
            documents into{' '}
            <span className="relative inline-block bg-gradient-to-r from-primary-600 via-primary-500 to-indigo-400 bg-clip-text text-transparent">
              AI chatbots
            </span>
          </h1>

          <p className="mt-6 max-w-md text-[1.1rem] leading-relaxed text-gray-500">
            Upload PDFs, Word docs, or text — get a smart, embeddable chatbot trained on your content in minutes.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link href="/auth/register" className="btn-primary gap-2 !px-6 !py-3 text-base shadow-md shadow-primary-200">
              Get started free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/auth/login" className="btn-secondary !px-6 !py-3 text-base">
              Sign in
            </Link>
          </div>

          <p className="mt-5 text-xs font-medium text-gray-400">
            No credit card required · Free plan available
          </p>
        </div>

        {/* ── Right: 3D Scene ─────────────────────────────── */}
        <div className="hidden h-[480px] w-full lg:block" aria-hidden>
          <HeroScene />
        </div>
      </div>
    </section>
  );
}
