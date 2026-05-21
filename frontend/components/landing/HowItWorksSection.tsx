'use client';

import dynamic from 'next/dynamic';
import { Upload, Cpu, Globe } from 'lucide-react';
import type { StepNumber } from '@/components/scenes/StepScene';
import { GlassCard } from '@/components/shared/GlassCard';

const StepScene = dynamic(() => import('@/components/scenes/StepScene'), {
  ssr: false,
  loading: () => <div className="h-full w-full" />,
});

const STEPS = [
  {
    step: 1 as StepNumber,
    icon: Upload,
    label: 'Phase 01',
    title: 'Ingest Knowledge',
    desc: 'Securely upload your PDFs, docs, or text. We accept enterprise-scale data sets with zero configuration.',
  },
  {
    step: 2 as StepNumber,
    icon: Cpu,
    label: 'Phase 02',
    title: 'Process & Embed',
    desc: 'Our pipeline automatically chunks, embeds, and indexes your data into a high-performance vector store.',
  },
  {
    step: 3 as StepNumber,
    icon: Globe,
    label: 'Phase 03',
    title: 'Deploy Globally',
    desc: 'Access your custom AI via a robust REST API or embed our customizable chat widget anywhere.',
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative py-32 z-10">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mb-20 flex flex-col items-center text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1">
            <Cpu className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Workflow</span>
          </div>
          <h2 className="text-[2.5rem] font-bold tracking-tight text-text-primary md:text-[3rem]">
            Seamless AI Integration
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-text-secondary">
            From raw data to a fully functional AI agent in minutes. Our pipeline handles the complex infrastructure for you.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 relative">
          {/* Connector Line */}
          <div className="hidden md:block absolute top-[110px] left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          
          {STEPS.map(({ step, icon: Icon, label, title, desc }, i) => (
            <GlassCard
              key={step}
              animated
              motionProps={{
                initial: { opacity: 0, y: 20 },
                whileInView: { opacity: 1, y: 0 },
                viewport: { once: true, margin: "-100px" },
                transition: { duration: 0.5, delay: i * 0.2 }
              }}
              className="relative flex flex-col overflow-hidden p-0"
            >
              {/* 3D Scene area */}
              <div className="flex h-56 items-center justify-center bg-surface/30 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-card/90 z-10" />
                <div className="w-full h-full opacity-70 mix-blend-screen">
                  <StepScene step={step} />
                </div>
              </div>

              {/* Content */}
              <div className="relative z-20 flex flex-col gap-4 p-8 pt-0">
                <div className="flex items-center gap-4 -mt-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 border border-primary/30 backdrop-blur-md shadow-glow-primary">
                    <Icon className="h-5 w-5 text-primary" aria-hidden />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-primary/80 mt-6">{label}</span>
                </div>
                <h3 className="text-xl font-bold text-text-primary mt-2">{title}</h3>
                <p className="text-base leading-relaxed text-text-secondary">{desc}</p>
              </div>

              {/* Step number watermark */}
              <span
                aria-hidden
                className="pointer-events-none absolute right-4 top-4 text-8xl font-black text-white/5 select-none leading-none z-0"
              >
                {step}
              </span>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
