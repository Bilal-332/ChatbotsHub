import dynamic from 'next/dynamic';
import { BrainCircuit, Zap, BarChart2, ShieldCheck } from 'lucide-react';
import type { FeatureType } from '@components/scenes/FeatureScene';

const FeatureScene = dynamic(() => import('@components/scenes/FeatureScene'), {
  ssr: false,
  loading: () => <div className="h-full w-full" />,
});

const FEATURES: {
  feature: FeatureType;
  icon: React.ElementType;
  title: string;
  desc: string;
  accent: string;
}[] = [
  {
    feature: 'ai',
    icon: BrainCircuit,
    title: 'AI Document Processing',
    desc: 'Automatic chunking, semantic embedding, and vector search — all without configuration.',
    accent: 'from-primary-50 to-indigo-50',
  },
  {
    feature: 'api',
    icon: Zap,
    title: 'REST API & Widget',
    desc: 'Query via a clean REST API or embed a chat widget on any page in under a minute.',
    accent: 'from-purple-50 to-primary-50',
  },
  {
    feature: 'analytics',
    icon: BarChart2,
    title: 'Usage Analytics',
    desc: 'Track queries, document usage, and monthly limits from a single dashboard.',
    accent: 'from-indigo-50 to-blue-50',
  },
  {
    feature: 'secure',
    icon: ShieldCheck,
    title: 'Secure & Isolated',
    desc: 'Each organization gets an isolated knowledge base. Your data never leaks to other tenants.',
    accent: 'from-primary-50 to-violet-50',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="bg-white py-28">
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary-600">
            Features
          </p>
          <h2 className="text-4xl font-extrabold tracking-tight text-gray-900">
            Everything you need, nothing you don&apos;t
          </h2>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ feature, icon: Icon, title, desc, accent }) => (
            <div
              key={feature}
              className="card group flex flex-col gap-5 overflow-hidden !p-0 transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              {/* Mini 3D visual */}
              <div className={`flex h-36 items-center justify-center bg-gradient-to-br ${accent}`}>
                <div className="h-24 w-24">
                  <FeatureScene feature={feature} />
                </div>
              </div>

              {/* Card body */}
              <div className="flex flex-col gap-2.5 px-5 pb-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 transition-transform group-hover:scale-110">
                  <Icon className="h-4.5 w-4.5 text-white" aria-hidden />
                </div>
                <h3 className="text-base font-bold text-gray-900">{title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
