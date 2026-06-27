export const PLAN_DISPLAY: Record<string, string> = {
  free: 'Free',
  starter: 'Starter',
  pro: 'Pro',
};

export const CONTACT_INFO = {
  email: 'bilalkhan.fullstack@gmail.com',
  whatsapp: '+923329368599',
  whatsappLink: 'https://wa.me/923329368599',
} as const;

export interface PricingPlanFeature {
  label: string;
  included: boolean;
}

export interface PricingPlan {
  id: 'free' | 'starter' | 'pro';
  name: string;
  price: number;
  period: string;
  description: string;
  recommended?: boolean;
  features: {
    chatbots: number;
    messages: number;
    documents: number;
    maxFileSizeMb: number;
  };
  highlights: string[];
}

/** Mirrors backend PLAN_LIMITS with SaaS pricing metadata */
export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'forever',
    description: 'Perfect for trying ChatbotsHub and small personal projects.',
    features: {
      chatbots: 1,
      messages: 100,
      documents: 3,
      maxFileSizeMb: 5,
    },
    highlights: [
      '1 AI chatbot workspace',
      '100 messages / month',
      '3 training documents',
      '5 MB max file size',
      'Embeddable widget',
      'API access',
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 35,
    period: 'month',
    description: 'Ideal for small businesses and growing teams.',
    recommended: true,
    features: {
      chatbots: 1,
      messages: 1000,
      documents: 10,
      maxFileSizeMb: 10,
    },
    highlights: [
      '1 AI chatbot workspace',
      '1,000 messages / month',
      '10 training documents',
      '10 MB max file size',
      'Custom branding & avatar',
      'Multilingual responses',
      'Priority email support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 199,
    period: 'month',
    description: 'For teams that need higher volume and advanced customization.',
    features: {
      chatbots: 1,
      messages: 10000,
      documents: 20,
      maxFileSizeMb: 15,
    },
    highlights: [
      '1 AI chatbot workspace',
      '10,000 messages / month',
      '20 training documents',
      '15 MB max file size',
      'Full theme customization',
      'Session memory & context',
      'Dedicated support',
    ],
  },
];

export const COMPARISON_FEATURES = [
  { key: 'chatbots', label: 'AI Chatbots' },
  { key: 'messages', label: 'Monthly Messages' },
  { key: 'documents', label: 'Training Documents' },
  { key: 'maxFileSizeMb', label: 'Max File Size' },
] as const;

export type SupportedLanguage = 'auto' | 'en' | 'ar' | 'ur';

export const LANGUAGE_OPTIONS: { value: SupportedLanguage; label: string }[] = [
  { value: 'auto', label: 'Auto-detect' },
  { value: 'en', label: 'English' },
  { value: 'ar', label: 'Arabic (العربية)' },
  { value: 'ur', label: 'Urdu (اردو)' },
];
