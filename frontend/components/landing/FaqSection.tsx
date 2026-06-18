'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { GlassCard } from '@/components/shared/GlassCard';
import { FAQ_ITEMS } from '@/lib/seo';

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  return (
    <section id="faq" className="relative py-32 z-10">
      <div className="mx-auto max-w-4xl px-6">
        {/* Header */}
        <div className="mb-16 flex flex-col items-center text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1">
            <HelpCircle className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">FAQ</span>
          </div>
          <h2 className="text-[2.5rem] font-bold tracking-tight text-text-primary md:text-[3rem]">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-text-secondary">
            Everything you need to know about building and deploying your AI chatbot with ChatbotsHub.
          </p>
        </div>

        {/* Accordion */}
        <div className="flex flex-col gap-4">
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = openIndex === i;
            const panelId = `faq-panel-${i}`;
            const buttonId = `faq-button-${i}`;

            return (
              <motion.div
                key={item.question}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <GlassCard className="!p-0 overflow-hidden">
                  <h3>
                    <button
                      id={buttonId}
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => toggle(i)}
                      className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-surface/40"
                    >
                      <span className="text-base font-semibold text-text-primary md:text-lg">
                        {item.question}
                      </span>
                      <ChevronDown
                        className={`h-5 w-5 shrink-0 text-primary transition-transform duration-300 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                        aria-hidden
                      />
                    </button>
                  </h3>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={panelId}
                        role="region"
                        aria-labelledby={buttonId}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <p className="px-6 pb-5 text-base leading-relaxed text-text-secondary">
                          {item.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
