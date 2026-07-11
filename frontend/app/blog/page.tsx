import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import {
  createMetadata,
  siteConfig,
  getBreadcrumbJsonLd,
  getBlogListingJsonLd,
  getOrganizationJsonLd,
  getWebSiteJsonLd,
} from '@/lib/seo';
import { getAllPosts, type BlogSearchPost } from '@/lib/blog/posts';
import { BlogSearch } from '@/components/blog/BlogSearch';
import { BlogNav } from '@/components/blog/BlogNav';
import { Footer } from '@/components/landing/Footer';

const PAGE_TITLE = 'Blog — AI Chatbot Guides, Tutorials & Insights';
const PAGE_DESCRIPTION =
  'Guides, tutorials, and insights on AI chatbots — how to build a chatbot for your website, train it on your documents, and choose the right AI chatbot platform.';

export const metadata: Metadata = createMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: '/blog',
    types: { 'application/rss+xml': '/feed.xml' },
  },
  openGraph: {
    type: 'website',
    locale: siteConfig.locale,
    url: `${siteConfig.url}/blog`,
    siteName: siteConfig.name,
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: `${siteConfig.name} Blog` }],
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

export default function BlogIndexPage() {
  const posts = getAllPosts();
  const searchPosts: BlogSearchPost[] = posts.map((p) => ({
    slug: p.slug,
    coverImage: p.coverImage,
    coverAlt: p.coverAlt,
    category: p.category,
    title: p.title,
    excerpt: p.excerpt,
    description: p.description,
    keywords: p.keywords,
    publishedAt: p.publishedAt,
    readingMinutes: p.readingMinutes,
  }));

  const schemas = [
    getOrganizationJsonLd(),
    getWebSiteJsonLd(),
    getBreadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Blog', path: '/blog' },
    ]),
    getBlogListingJsonLd(posts.map((p) => ({ title: p.title, slug: p.slug }))),
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
            <span className="text-text-primary">Blog</span>
          </nav>

          <header className="mb-14 max-w-2xl">
            <span className="badge badge-blue mb-4">ChatbotsHub Blog</span>
            <h1 className="text-4xl font-bold tracking-tight text-text-primary md:text-5xl">
              AI Chatbot Guides, Tutorials &amp; Insights
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-text-secondary">
              Learn how to build, train, and deploy AI chatbots for your website. Practical guides on
              chatbot software, RAG, multilingual support, and growing your business with automation.
            </p>
            <Link href="/auth/register" className="btn-primary mt-8 inline-flex">
              Start building free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </header>

          <BlogSearch posts={searchPosts} />
        </main>

        <Footer />
      </div>
    </>
  );
}
