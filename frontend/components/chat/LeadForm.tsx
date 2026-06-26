'use client';

import { useState, type FormEvent } from 'react';
import { Loader2, X } from 'lucide-react';

export interface LeadFormValues {
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
}

export function LeadForm({
  primaryColor,
  isSubmitting,
  onSubmit,
  onDismiss,
}: {
  primaryColor: string;
  isSubmitting: boolean;
  onSubmit: (values: LeadFormValues) => void;
  onDismiss: () => void;
}) {
  const [values, setValues] = useState<LeadFormValues>({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
  });

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim());
  const canSubmit = values.name.trim().length > 0 && emailValid && !isSubmitting;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({
      name: values.name.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      company: values.company.trim(),
      message: values.message.trim(),
    });
  };

  const set = (key: keyof LeadFormValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setValues((prev) => ({ ...prev, [key]: e.target.value }));

  const inputClass =
    'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-transparent focus:ring-2';
  const ringStyle = { '--tw-ring-color': primaryColor } as React.CSSProperties;

  return (
    <div className="mx-1 mb-3 rounded-2xl border border-gray-200 bg-gray-50 p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-gray-800">Let&apos;s get you connected</p>
          <p className="mt-0.5 text-xs text-gray-500">
            Share your details and our team will reach out shortly.
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          disabled={isSubmitting}
          className="rounded p-1 text-gray-400 transition-colors hover:text-gray-700"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-2.5">
        <input
          type="text"
          required
          value={values.name}
          onChange={set('name')}
          placeholder="Full name *"
          className={inputClass}
          style={ringStyle}
          disabled={isSubmitting}
          maxLength={120}
        />
        <input
          type="email"
          required
          value={values.email}
          onChange={set('email')}
          placeholder="Email *"
          className={inputClass}
          style={ringStyle}
          disabled={isSubmitting}
          maxLength={200}
        />
        <input
          type="tel"
          value={values.phone}
          onChange={set('phone')}
          placeholder="Phone (optional)"
          className={inputClass}
          style={ringStyle}
          disabled={isSubmitting}
          maxLength={40}
        />
        <input
          type="text"
          value={values.company}
          onChange={set('company')}
          placeholder="Company (optional)"
          className={inputClass}
          style={ringStyle}
          disabled={isSubmitting}
          maxLength={160}
        />
        <textarea
          value={values.message}
          onChange={set('message')}
          placeholder="How can we help? (optional)"
          rows={2}
          className={`${inputClass} resize-none`}
          style={ringStyle}
          disabled={isSubmitting}
          maxLength={2000}
        />

        <button
          type="submit"
          disabled={!canSubmit}
          className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
          style={{ backgroundColor: primaryColor }}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit'
          )}
        </button>
      </form>
    </div>
  );
}
