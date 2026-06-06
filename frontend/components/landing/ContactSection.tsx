'use client';

import { useState, type FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';
import { motion } from 'framer-motion';
import { Loader2, Mail, MessageCircle, Send, Phone } from 'lucide-react';
import { GlassCard } from '@/components/shared/GlassCard';
import { contactApi } from '@/lib/api';
import { CONTACT_INFO } from '@/lib/constants';

export function ContactSection() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
    website: '', // honeypot
  });

  const { mutate: submitContact, isPending } = useMutation({
    mutationFn: () =>
      contactApi.submit({
        name: form.name.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
        company: form.company.trim() || undefined,
        website: form.website,
      }),
    onSuccess: () => {
      toast.success('Message sent! We will get back to you soon.');
      setForm({ name: '', email: '', company: '', message: '', website: '' });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message ?? 'Failed to send message.');
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;
    submitContact();
  };

  return (
    <section id="contact" className="relative py-32 z-10">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 flex flex-col items-center text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1">
            <MessageCircle className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Contact</span>
          </div>
          <h2 className="text-[2.5rem] font-bold tracking-tight text-text-primary md:text-[3rem]">
            Get in Touch
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-text-secondary">
            Ready to upgrade your plan or have questions? Reach out — we typically respond within 24 hours.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          {/* Quick contact */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2 space-y-6"
          >
            <GlassCard className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-text-primary">Quick Contact</h3>
                <p className="mt-1 text-sm text-text-secondary">
                  Prefer a direct conversation? Reach us instantly.
                </p>
              </div>

              <a
                href={CONTACT_INFO.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 rounded-xl border border-border bg-surface/50 p-4 transition hover:border-status-success/40 hover:bg-status-success/5"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-status-success/10">
                  <Phone className="h-5 w-5 text-status-success" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">WhatsApp</p>
                  <p className="text-sm text-text-secondary">{CONTACT_INFO.whatsapp}</p>
                </div>
              </a>

              <a
                href={`mailto:${CONTACT_INFO.email}`}
                className="flex items-center gap-4 rounded-xl border border-border bg-surface/50 p-4 transition hover:border-primary/40 hover:bg-primary/5"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">Email</p>
                  <p className="text-sm text-text-secondary">{CONTACT_INFO.email}</p>
                </div>
              </a>
            </GlassCard>
          </motion.div>

          {/* Contact form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-3"
          >
            <GlassCard className="p-8">
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                {/* Honeypot — hidden from users */}
                <input
                  type="text"
                  name="website"
                  value={form.website}
                  onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))}
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                />

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="contact-name" className="mb-2 block text-sm font-medium text-text-primary">
                      Name *
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      minLength={2}
                      maxLength={100}
                      className="input"
                      placeholder="Your name"
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      disabled={isPending}
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="mb-2 block text-sm font-medium text-text-primary">
                      Email *
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      className="input"
                      placeholder="you@company.com"
                      value={form.email}
                      onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                      disabled={isPending}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-company" className="mb-2 block text-sm font-medium text-text-primary">
                    Company <span className="text-text-secondary">(optional)</span>
                  </label>
                  <input
                    id="contact-company"
                    type="text"
                    maxLength={100}
                    className="input"
                    placeholder="Your company"
                    value={form.company}
                    onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))}
                    disabled={isPending}
                  />
                </div>

                <div>
                  <label htmlFor="contact-message" className="mb-2 block text-sm font-medium text-text-primary">
                    Message *
                  </label>
                  <textarea
                    id="contact-message"
                    required
                    minLength={10}
                    maxLength={2000}
                    rows={5}
                    className="input resize-none"
                    placeholder="Tell us about your needs, plan upgrade, or questions..."
                    value={form.message}
                    onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                    disabled={isPending}
                  />
                </div>

                <button type="submit" className="btn-primary w-full !py-3" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
