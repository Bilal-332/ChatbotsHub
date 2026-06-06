'use client';

import Link from 'next/link';
import { Check, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/shared/GlassCard';
import { PRICING_PLANS, COMPARISON_FEATURES } from '@/lib/constants';
import { cn } from '@/lib/utils';

function formatFeatureValue(key: string, value: number): string {
  if (key === 'maxFileSizeMb') return `${value} MB`;
  if (key === 'messages' || key === 'documents') return value.toLocaleString();
  return String(value);
}

export function PricingSection() {
  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="pricing" className="relative py-32 z-10">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 flex flex-col items-center text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Pricing</span>
          </div>
          <h2 className="text-[2.5rem] font-bold tracking-tight text-text-primary md:text-[3rem]">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-text-secondary">
            Start free, scale when you need more. All plans include document training, embeddable widgets, and API access.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {PRICING_PLANS.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={cn(plan.recommended && 'lg:-mt-4 lg:mb-4')}
            >
              <GlassCard
                className={cn(
                  'relative flex h-full flex-col p-8',
                  plan.recommended && 'border-primary/40 shadow-glow-primary ring-1 ring-primary/20',
                )}
              >
                {plan.recommended && (
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-bold uppercase tracking-wider text-white">
                    Recommended
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-bold text-text-primary">{plan.name}</h3>
                  <p className="mt-2 text-sm text-text-secondary">{plan.description}</p>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-text-primary">
                      {plan.price === 0 ? 'Free' : `$${plan.price}`}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-sm text-text-secondary">/{plan.period}</span>
                    )}
                  </div>
                </div>

                <ul className="mb-8 flex-1 space-y-3">
                  {plan.highlights.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-text-secondary">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-status-success" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {plan.price === 0 ? (
                  <Link
                    href="/auth/register"
                    className={cn('w-full justify-center', 'btn-primary')}
                  >
                    Get Started Free
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={scrollToContact}
                    className={cn(
                      'w-full justify-center',
                      plan.recommended ? 'btn-primary' : 'btn-secondary',
                    )}
                  >
                    Contact to Upgrade
                  </button>
                )}
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Feature comparison table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-16 overflow-hidden rounded-2xl border border-border bg-card/50 backdrop-blur-sm"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-4 text-left font-semibold text-text-primary">Feature</th>
                  {PRICING_PLANS.map((plan) => (
                    <th
                      key={plan.id}
                      className={cn(
                        'px-6 py-4 text-center font-semibold',
                        plan.recommended ? 'text-primary' : 'text-text-primary',
                      )}
                    >
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON_FEATURES.map((row) => (
                  <tr key={row.key} className="border-b border-border/50">
                    <td className="px-6 py-4 text-text-secondary">{row.label}</td>
                    {PRICING_PLANS.map((plan) => (
                      <td
                        key={plan.id}
                        className={cn(
                          'px-6 py-4 text-center font-medium',
                          plan.recommended ? 'text-primary' : 'text-text-primary',
                        )}
                      >
                        {formatFeatureValue(row.key, plan.features[row.key])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
