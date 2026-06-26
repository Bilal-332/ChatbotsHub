'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Globe, UserPlus, BarChart3, Sparkles, ArrowRight } from 'lucide-react';
import { GlassCard } from '@/components/shared/GlassCard';

const NEW_FEATURES = [
  {
    icon: Globe,
    title: 'Website URL Training',
    desc: 'Skip the manual uploads. Paste a website URL and ChatbotsHub crawls the pages, strips the noise, and indexes clean content into your knowledge base automatically.',
    points: ['Same-origin crawler', 'Automatic content cleaning', 'Up to 1,000 pages per site'],
    href: '/blog/train-chatbot-from-website-url',
    linkLabel: 'How website training works',
  },
  {
    icon: UserPlus,
    title: 'Lead Capture System',
    desc: 'Turn conversations into pipeline. AI intent detection spots buying signals and shows a lead form at the perfect moment — then notifies your team instantly.',
    points: ['AI intent classification', 'Instant email alerts', 'CSV export & pipeline statuses'],
    href: '/blog/ai-chatbot-lead-capture',
    linkLabel: 'See lead capture in action',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    desc: 'Know exactly how your chatbot performs. Track conversations, engagement, answer quality, top questions, and lead conversion across any date range.',
    points: ['Conversations & engagement', 'Answered vs unanswered', 'Conversion & top questions'],
    href: '/blog/chatbot-analytics-dashboard',
    linkLabel: 'Explore the analytics guide',
  },
];

export function NewFeaturesSection() {
  return (
    <section id="new-features" className="relative py-32 z-10">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mb-20 flex flex-col items-center text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">New</span>
          </div>
          <h2 className="text-[2.5rem] font-bold tracking-tight text-text-primary md:text-[3rem]">
            More Ways to Grow with Your Chatbot
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-text-secondary">
            Train from live websites, convert chats into leads, and measure everything — all built right into ChatbotsHub.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {NEW_FEATURES.map((item, i) => (
            <GlassCard
              key={item.title}
              animated
              motionProps={{
                initial: { opacity: 0, y: 20 },
                whileInView: { opacity: 1, y: 0 },
                viewport: { once: true, margin: '-100px' },
                transition: { duration: 0.5, delay: i * 0.1 },
              }}
              className="flex flex-col gap-4 p-8"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 border border-primary/30 backdrop-blur-md shadow-glow-primary">
                <item.icon className="h-6 w-6 text-primary" />
              </div>

              <h3 className="text-xl font-bold text-text-primary">{item.title}</h3>
              <p className="text-base text-text-secondary">{item.desc}</p>

              <ul className="mt-1 space-y-2">
                {item.points.map((point) => (
                  <li key={point} className="flex items-center gap-2 text-sm text-text-secondary">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {point}
                  </li>
                ))}
              </ul>

              <Link
                href={item.href}
                className="group mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-semibold text-primary transition-colors hover:text-accent"
              >
                {item.linkLabel}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
