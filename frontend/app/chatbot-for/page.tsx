import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Plug, Building2 } from 'lucide-react';
import {
  createMetadata,
  siteConfig,
  getOrganizationJsonLd,
  getWebSiteJsonLd,
  getBreadcrumbJsonLd,
} from '@/lib/seo';
import { getSolutionsByType, type Solution } from '@/lib/landing/solutions';
import { BlogNav } from '@/components/blog/BlogNav';
import { Footer } from '@/components/landing/Footer';

const PAGE_TITLE = 'AI Chatbot Solutions & Integrations';
const PAGE_DESCRIPTION =
  'Add an AI chatbot to any platform or industry. Explore ChatbotsHub integrations (WordPress, Shopify, Webflow, Wix, Next.js, React) and use cases (real estate, ecommerce, SaaS support, healthcare, education).';

export const metadata: Metadata = createMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: '/chatbot-for' },
  openGraph: {
    type: 'website',
    locale: siteConfig.locale,
    url: `${siteConfig.url}/chatbot-for`,
    siteName: siteConfig.name,
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: PAGE_TITLE }],
  },
  twitter: {
    card: 'summary_large_image',
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    site: siteConfig.twitterHandle,
    creator: siteConfig.creator,
    images: [siteConfig.ogImage],
  },
});

function SolutionGrid({ solutions }: { solutions: Solution[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {solutions.map((solution) => (
        <Link
          key={solution.slug}
          href={`/chatbot-for/${solution.slug}`}
          className="group flex h-full flex-col rounded-2xl border border-border bg-surface/50 p-6 transition-colors hover:border-primary/40"
        >
          <p className="text-base font-semibold text-text-primary group-hover:text-primary">
            AI Chatbot for {solution.name}
          </p>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-text-secondary">
            {solution.heroSubtitle}
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary">
            Learn more
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      ))}
    </div>
  );
}

export default function SolutionsHubPage() {
  const integrations = getSolutionsByType('integration');
  const industries = getSolutionsByType('industry');

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${siteConfig.url}/chatbot-for#collection`,
    url: `${siteConfig.url}/chatbot-for`,
    name: `${siteConfig.name} — ${PAGE_TITLE}`,
    description: PAGE_DESCRIPTION,
    isPartOf: { '@id': `${siteConfig.url}/#website` },
    hasPart: [...integrations, ...industries].map((s) => ({
      '@type': 'WebPage',
      name: `AI Chatbot for ${s.name}`,
      url: `${siteConfig.url}/chatbot-for/${s.slug}`,
    })),
  };

  const schemas = [
    getOrganizationJsonLd(),
    getWebSiteJsonLd(),
    getBreadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Solutions', path: '/chatbot-for' },
    ]),
    itemList,
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

        <main className="mx-auto max-w-5xl px-6 pb-24 pt-16">
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-text-secondary">
            <Link href="/" className="hover:text-primary">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-text-primary">Solutions</span>
          </nav>

          <header className="mb-14 max-w-2xl">
            <span className="badge badge-blue mb-4">Solutions</span>
            <h1 className="text-4xl font-bold tracking-tight text-text-primary md:text-5xl">
              An AI Chatbot for Every Platform &amp; Industry
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-text-secondary">
              ChatbotsHub trains on your own content and embeds anywhere with a single script. Pick
              your platform or industry to see exactly how to launch an AI chatbot fast.
            </p>
            <Link href="/auth/register" className="btn-primary mt-8 inline-flex">
              Start building free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </header>

          <section aria-label="Integrations" className="mb-16">
            <div className="mb-6 flex items-center gap-2">
              <Plug className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold tracking-tight text-text-primary">Integrations</h2>
            </div>
            <SolutionGrid solutions={integrations} />
          </section>

          <section aria-label="Industries">
            <div className="mb-6 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold tracking-tight text-text-primary">Industries</h2>
            </div>
            <SolutionGrid solutions={industries} />
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}
