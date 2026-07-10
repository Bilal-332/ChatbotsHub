'use client';

import dynamic from 'next/dynamic';
import { BrainCircuit, Zap, BarChart2, ShieldCheck, Database, LayoutGrid } from 'lucide-react';
import { GlassCard } from '@/components/shared/GlassCard';
import type { FeatureType } from '@/components/scenes/FeatureScene';
import { LazyScene } from '@/components/scenes/LazyScene';

const FeatureScene = dynamic(() => import('@/components/scenes/FeatureScene'), {
  ssr: false,
  loading: () => <div className="h-full w-full" />,
});

const FEATURES = [
  {
    feature: 'ai' as FeatureType,
    icon: BrainCircuit,
    title: 'Advanced AI Processing',
    desc: 'Automatic chunking, semantic embedding, and vector search with zero configuration required.',
    colSpan: 'md:col-span-2 lg:col-span-2',
    rowSpan: 'row-span-2',
    height: 'min-h-[400px]',
  },
  {
    feature: 'secure' as FeatureType,
    icon: ShieldCheck,
    title: 'Enterprise Security',
    desc: 'Isolated knowledge bases ensure your data never leaks to other tenants. secured infrastructure.',
    colSpan: 'md:col-span-1 lg:col-span-2',
    rowSpan: 'row-span-1',
    height: 'min-h-[250px]',
  },
  {
    feature: 'api' as FeatureType,
    icon: Zap,
    title: 'Robust API',
    desc: 'Query via our high-performance REST API or use our pre-built SDKs.',
    colSpan: 'md:col-span-1 lg:col-span-1',
    rowSpan: 'row-span-1',
    height: 'min-h-[250px]',
  },
  {
    feature: 'analytics' as FeatureType,
    icon: BarChart2,
    title: 'Usage Analytics',
    desc: 'Deep insights into query patterns and model performance.',
    colSpan: 'md:col-span-1 lg:col-span-1',
    rowSpan: 'row-span-1',
    height: 'min-h-[250px]',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-32 z-10">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mb-20 flex flex-col items-center text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1">
            <LayoutGrid className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Capabilities</span>
          </div>
          <h2 className="text-[2.5rem] font-bold tracking-tight text-text-primary md:text-[3rem]">
            Built for Scale and Precision
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-text-secondary">
            Everything you need to build production-grade AI applications, packed into a single, cohesive platform.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {FEATURES.map((item, i) => (
            <GlassCard
              key={i}
              animated
              motionProps={{
                initial: { opacity: 0, y: 20 },
                whileInView: { opacity: 1, y: 0 },
                viewport: { once: true, margin: "-100px" },
                transition: { duration: 0.5, delay: i * 0.1 }
              }}
              className={`flex flex-col overflow-hidden p-0 ${item.colSpan} ${item.rowSpan} ${item.height}`}
            >
              {/* Scene Area — dark radial backdrop makes the neon meshes pop */}
              <div className="relative flex-1 min-h-[150px] flex items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_35%,rgba(23,31,74,0.35),rgba(2,4,12,0.95))]">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-card/60 z-10" />
                <LazyScene className="w-full h-full opacity-100">
                  <FeatureScene feature={item.feature} />
                </LazyScene>
              </div>

              {/* Content Area */}
              <div className="relative z-20 flex flex-col gap-3 p-8 pt-0">
                <div className="flex h-12 w-12 -mt-6 items-center justify-center rounded-xl bg-primary/20 border border-primary/30 backdrop-blur-md mb-2 shadow-glow-primary">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-text-primary">{item.title}</h3>
                <p className="text-base text-text-secondary">{item.desc}</p>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
