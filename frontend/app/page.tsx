import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Navbar } from '@components/landing/Navbar';
import { StaticBackground } from '@/components/shared/StaticBackground';
import { JsonLd } from '@/components/seo/JsonLd';
import { createMetadata, siteConfig } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: siteConfig.title,
  description: siteConfig.description,
  alternates: { canonical: '/' },
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
      <Navbar />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <NewFeaturesSection />
        <PricingSection />
        <DashboardPreviewSection />
        <FaqSection />
        <ContactSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
