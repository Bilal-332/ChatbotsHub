import dynamic from 'next/dynamic';
import { Upload, Cpu, Globe } from 'lucide-react';
import type { StepNumber } from '@components/scenes/StepScene';

const StepScene = dynamic(() => import('@components/scenes/StepScene'), {
  ssr: false,
  loading: () => <div className="h-full w-full" />,
});

const STEPS: {
  step: StepNumber;
  icon: React.ElementType;
  label: string;
  title: string;
  desc: string;
}[] = [
  {
    step: 1,
    icon: Upload,
    label: 'Step 01',
    title: 'Upload your documents',
    desc: 'Drop in PDFs, Word files, or plain text. We accept any content you already have.',
  },
  {
    step: 2,
    icon: Cpu,
    label: 'Step 02',
    title: 'AI processing & indexing',
    desc: 'Your content is automatically chunked, embedded, and stored in a vector knowledge base.',
  },
  {
    step: 3,
    icon: Globe,
    label: 'Step 03',
    title: 'Deploy via API or embed',
    desc: 'Query your chatbot through our REST API or drop a two-line script into any webpage.',
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-gray-50 py-28">
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary-600">
            How it works
          </p>
          <h2 className="text-4xl font-extrabold tracking-tight text-gray-900">
            Three steps to a smarter chatbot
          </h2>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {STEPS.map(({ step, icon: Icon, label, title, desc }) => (
            <div
              key={step}
              className="card relative flex flex-col overflow-hidden !p-0 transition-shadow hover:shadow-md"
            >
              {/* 3D Scene area */}
              <div className="flex h-44 items-center justify-center bg-gradient-to-br from-primary-50 to-indigo-50">
                <div className="h-36 w-36">
                  <StepScene step={step} />
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-col gap-3 p-7">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600">
                    <Icon className="h-4.5 w-4.5 text-white" aria-hidden />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">{label}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{desc}</p>
              </div>

              {/* Step number watermark */}
              <span
                aria-hidden
                className="pointer-events-none absolute right-5 top-3 text-7xl font-black text-primary-100 select-none leading-none"
              >
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
