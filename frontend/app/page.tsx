import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import Script from 'next/script';
import { Navbar } from '@components/landing/Navbar';
import { StaticBackground } from '@/components/shared/StaticBackground';
import { JsonLd } from '@/components/seo/JsonLd';
import { createMetadata } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'ChatbotsHub | Build Custom AI Chatbots From Documents',
  description:
    'Transform your files into intelligent assistants instantly. ChatbotsHub lets you build, embed, and deploy RAG-powered AI chatbots using your own documentation.',
  alternates: {
    canonical: '/',
    types: { 'application/rss+xml': '/feed.xml' },
  },
});

const HeroSection = dynamic(
  () => import('@components/landing/HeroSection').then((m) => m.HeroSection),
  { loading: () => <div className="min-h-screen" /> },
);

const HowItWorksSection = dynamic(
  () => import('@components/landing/HowItWorksSection').then((m) => m.HowItWorksSection),
);

const FeaturesSection = dynamic(
  () => import('@components/landing/FeaturesSection').then((m) => m.FeaturesSection),
);

const NewFeaturesSection = dynamic(
  () => import('@components/landing/NewFeaturesSection').then((m) => m.NewFeaturesSection),
);

const PricingSection = dynamic(
  () => import('@components/landing/PricingSection').then((m) => m.PricingSection),
);

const DashboardPreviewSection = dynamic(
  () => import('@components/landing/DashboardPreviewSection').then((m) => m.DashboardPreviewSection),
);

const ContactSection = dynamic(
  () => import('@components/landing/ContactSection').then((m) => m.ContactSection),
);

const FaqSection = dynamic(
  () => import('@components/landing/FaqSection').then((m) => m.FaqSection),
);

const CTASection = dynamic(
  () => import('@components/landing/CTASection').then((m) => m.CTASection),
);

const Footer = dynamic(
  () => import('@components/landing/Footer').then((m) => m.Footer),
);

export default function LandingPage() {
  return (
    <>
      <JsonLd />
      <StaticBackground />
      <Script
        src="https://chatbotshub.me/widget.js"
        data-api-key="chk_fd4c6e91a5ee4319a9c0e1af421ea20c"
        strategy="afterInteractive"
      />
      <Navbar />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <NewFeaturesSection />
        <PricingSection />
        <DashboardPreviewSection />
        <ContactSection />
        <CTASection />
        <FaqSection />
      </main>
      <Footer />
    </>
  );
}
