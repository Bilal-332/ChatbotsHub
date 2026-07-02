import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Check, Sparkles, Plug, Building2 } from 'lucide-react';
import {
  createMetadata,
  siteConfig,
  getOrganizationJsonLd,
  getWebSiteJsonLd,
  getWebPageJsonLd,
  getSoftwareApplicationJsonLd,
  getBreadcrumbJsonLd,
  getFaqJsonLd,
} from '@/lib/seo';
import {
  SOLUTIONS,
  getSolutionBySlug,
  getSolutionHeading,
  getRelatedSolutions,
} from '@/lib/landing/solutions';
import { GlassCard } from '@/components/shared/GlassCard';
import { BlogNav } from '@/components/blog/BlogNav';
import { Footer } from '@/components/landing/Footer';

interface SolutionPageProps {
  params: { slug: string };
}

export function generateStaticParams() {
  return SOLUTIONS.map((solution) => ({ slug: solution.slug }));
}

export function generateMetadata({ params }: SolutionPageProps): Metadata {
  const solution = getSolutionBySlug(params.slug);
  if (!solution) {
    return createMetadata({ title: 'Page not found', robots: { index: false, follow: true } });
  }

  const url = `${siteConfig.url}/chatbot-for/${solution.slug}`;
  return createMetadata({
    title: solution.metaTitle,
    description: solution.metaDescription,
    keywords: solution.keywords,
    alternates: { canonical: `/chatbot-for/${solution.slug}` },
    openGraph: {
      type: 'website',
      locale: siteConfig.locale,
      url,
      siteName: siteConfig.name,
      title: solution.metaTitle,
      description: solution.metaDescription,
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: getSolutionHeading(solution),
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: solution.metaTitle,
      description: solution.metaDescription,
      site: siteConfig.twitterHandle,
      creator: siteConfig.creator,
      images: [siteConfig.ogImage],
    },
  });
}

export default function SolutionPage({ params }: SolutionPageProps) {
  const solution = getSolutionBySlug(params.slug);
  if (!solution) notFound();

  const heading = getSolutionHeading(solution);
  const related = getRelatedSolutions(solution.slug, 3);
  const parentLabel = solution.type === 'integration' ? 'Integrations' : 'Industries';

  const schemas = [
    getOrganizationJsonLd(),
    getWebSiteJsonLd(),
    getWebPageJsonLd({
      path: `/chatbot-for/${solution.slug}`,
      title: heading,
      description: solution.metaDescription,
    }),
    getSoftwareApplicationJsonLd(),
    getBreadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Solutions', path: '/chatbot-for' },
      { name: heading, path: `/chatbot-for/${solution.slug}` },
    ]),
    getFaqJsonLd(solution.faqs),
  ];

  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <div className="min-h-screen bg-background">
        <BlogNav />

        <main className="mx-auto max-w-5xl px-6 pb-24 pt-12">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-8 text-sm text-text-secondary">
            <Link href="/" className="hover:text-primary">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link href="/chatbot-for" className="hover:text-primary">
              Solutions
            </Link>
            <span className="mx-2">/</span>
            <span className="text-text-primary">{solution.name}</span>
          </nav>

          {/* Hero */}
          <header className="max-w-3xl">
            <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
              {solution.type === 'integration' ? (
                <Plug className="h-3.5 w-3.5" />
              ) : (
                <Building2 className="h-3.5 w-3.5" />
              )}
              {solution.heroTagline}
            </span>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-text-primary md:text-5xl">
              {heading}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-text-secondary">
              {solution.heroSubtitle}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/auth/register" className="btn-primary inline-flex">
                Start building free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/#pricing" className="btn-secondary inline-flex">
                View pricing
              </Link>
            </div>
          </header>

          {/* Intro */}
          <section className="mt-16 max-w-3xl space-y-4">
            {solution.intro.map((paragraph, i) => (
              <p key={i} className="text-base leading-relaxed text-text-secondary">
                {paragraph}
              </p>
            ))}
          </section>

          {/* Benefits */}
          <section className="mt-16" aria-label={`Benefits of an AI chatbot for ${solution.name}`}>
            <h2 className="text-2xl font-bold tracking-tight text-text-primary md:text-3xl">
              Why use an AI chatbot for {solution.name}?
            </h2>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {solution.benefits.map((benefit) => (
                <GlassCard key={benefit.title} className="p-6">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary">{benefit.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                    {benefit.description}
                  </p>
                </GlassCard>
              ))}
            </div>
          </section>

          {/* Steps */}
          <section className="mt-16 max-w-3xl">
            <h2 className="text-2xl font-bold tracking-tight text-text-primary md:text-3xl">
              How to add an AI chatbot to {solution.name}
            </h2>
            <ol className="mt-8 space-y-5">
              {solution.steps.map((step, i) => (
                <li key={i} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-sm font-bold text-primary">
                    {i + 1}
                  </span>
                  <p className="pt-1 text-base leading-relaxed text-text-secondary">{step}</p>
                </li>
              ))}
            </ol>
          </section>

          {/* Use cases */}
          <section className="mt-16 max-w-3xl">
            <h2 className="text-2xl font-bold tracking-tight text-text-primary md:text-3xl">
              What you can do with it
            </h2>
            <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {solution.useCases.map((useCase) => (
                <li key={useCase} className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <span className="text-sm leading-relaxed text-text-secondary">{useCase}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* CTA band */}
          <section className="mt-16">
            <GlassCard className="flex flex-col items-start gap-4 p-8 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-text-primary">
                  Launch your {solution.name} chatbot today
                </h2>
                <p className="mt-1 text-sm text-text-secondary">
                  Free plan, no credit card. Train on your content and embed in minutes.
                </p>
              </div>
              <Link href="/auth/register" className="btn-primary inline-flex whitespace-nowrap">
                Get started free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </GlassCard>
          </section>

          {/* FAQ */}
          <section className="mt-16 max-w-3xl" aria-label="Frequently asked questions">
            <h2 className="text-2xl font-bold tracking-tight text-text-primary md:text-3xl">
              Frequently asked questions
            </h2>
            <div className="mt-8 space-y-4">
              {solution.faqs.map((faq) => (
                <details
                  key={faq.question}
                  className="group rounded-2xl border border-border bg-surface/50 p-5"
                >
                  <summary className="cursor-pointer list-none text-base font-semibold text-text-primary marker:hidden">
                    {faq.question}
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-text-secondary">{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>

          {/* Related / internal linking */}
          {related.length > 0 && (
            <section className="mt-16" aria-label="Related solutions">
              <h2 className="mb-6 text-xl font-bold tracking-tight text-text-primary">
                Explore more {parentLabel.toLowerCase()}
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {related.map((rel) => (
                  <Link
                    key={rel.slug}
                    href={`/chatbot-for/${rel.slug}`}
                    className="group rounded-2xl border border-border bg-surface/50 p-5 transition-colors hover:border-primary/40"
                  >
                    <p className="text-sm font-semibold text-text-primary group-hover:text-primary">
                      AI Chatbot for {rel.name}
                    </p>
                    <span className="mt-2 inline-flex items-center gap-1 text-xs text-text-secondary">
                      Learn more
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                ))}
              </div>
              <div className="mt-8 text-sm text-text-secondary">
                Want the fundamentals first? Read{' '}
                <Link href="/blog/what-is-an-ai-chatbot-platform" className="text-primary hover:underline">
                  what an AI chatbot platform is
                </Link>{' '}
                or browse all{' '}
                <Link href="/chatbot-for" className="text-primary hover:underline">
                  chatbot solutions
                </Link>
                .
              </div>
            </section>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
}
