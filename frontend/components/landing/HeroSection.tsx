'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const HeroScene = dynamic(() => import('@/components/scenes/HeroScene'), {
  ssr: false,
  loading: () => <div className="h-full w-full" />,
});

export function HeroSection() {
  return (
    <section className="relative flex min-h-screen items-center overflow-visible pt-16">
      <div className="relative mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-16 px-6 py-24 lg:grid-cols-2 z-10 overflow-visible">
        
        {/* ── Left: Copy ─────────────────────────────────── */}
        <div className="flex flex-col">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 backdrop-blur-sm"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-primary tracking-wide">Enterprise AI Knowledge Infrastructure</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-[3.5rem] font-bold leading-[1.1] tracking-tight text-text-primary sm:text-[4.5rem]"
          >
            <span className="sr-only">ChatbotsHub — </span>
            Deploy Intelligent<br />
            <span className="relative inline-block bg-gradient-to-r from-primary via-[#7C4DFF] to-indigo-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(91,108,255,0.3)]">
              AI Agents
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 max-w-xl text-[1.25rem] leading-relaxed text-text-secondary"
          >
            Transform your enterprise data into autonomous AI chatbots. ChatbotsHub, often searched as botshub,
            is built for scale, security, and precision.
          </motion.p>

         

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-12 flex flex-wrap items-center gap-5"
          >
            <Link href="/auth/register" className="btn-primary !px-8 !py-4 text-base font-semibold group">
              Start Building
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/auth/login" className="btn-secondary !px-8 !py-4 text-base font-semibold">
              View Demo
            </Link>
          </motion.div>

          <motion.p
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ duration: 0.5, delay: 0.6 }}
             className="mt-6 text-sm font-medium text-text-secondary/60"
          >
            Trusted by innovative teams worldwide. No credit card required.
          </motion.p>
           <motion.figure
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="mt-6 w-fit rounded-2xl border border-primary/20 bg-surface/40 p-3 backdrop-blur"
          >
            <img
              src="/opengraph-image"
              alt="botshub interface layout"
              className="h-1 w-2 rounded-lg object-cover"
              loading="lazy"
            />
          </motion.figure>
        </div>

        {/* ── Right: 3D Scene ─────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="hidden h-[600px] w-full lg:block relative overflow-visible"
          aria-hidden
        >
          {/* Subtle glow behind the 3D scene */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
          <HeroScene />
        </motion.div>
      </div>
    </section>
  );
}
