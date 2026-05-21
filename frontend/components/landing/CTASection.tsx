'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export function CTASection() {
  return (
    <section className="relative overflow-hidden py-32 z-10 border-t border-border">
      {/* Background mesh/grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/90" />

      <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-8 px-6 text-center">
        {/* Animated glow rings */}
        <div
          aria-hidden
          className="absolute left-1/2 top-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[100px]"
        />
        <div
          aria-hidden
          className="absolute left-1/2 top-1/2 -z-10 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-accent/20 blur-[80px]"
        />

        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 backdrop-blur-sm">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-primary tracking-wide">Ready to Scale?</span>
        </div>

        <h2 className="text-[3rem] font-extrabold tracking-tight text-text-primary sm:text-[4rem] leading-[1.1]">
          Start building AI agents<br className="hidden sm:block" /> today.
        </h2>

        <p className="max-w-2xl text-xl text-text-secondary">
          Join forward-thinking teams using ChatbotsHub to transform their enterprise knowledge into actionable AI.
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-5">
          <Link
            href="/auth/register"
            className="btn-primary !px-8 !py-4 text-base font-semibold group"
          >
            Create free account
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/auth/login"
            className="btn-secondary !px-8 !py-4 text-base font-semibold"
          >
            Contact Sales
          </Link>
        </div>

        <p className="mt-4 text-sm font-medium text-text-secondary/60">No credit card required · SOC2 Compliant · Free tier available</p>
      </div>
    </section>
  );
}
