import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';
import {
  createMetadata,
  siteConfig,
  getBreadcrumbJsonLd,
  getBlogPostingJsonLd,
  getOrganizationJsonLd,
  getWebSiteJsonLd,
} from '@/lib/seo';
import {
  BLOG_POSTS,
  getAllPosts,
  getPostBySlug,
  getPostCoverPath,
  getRelatedPosts,
} from '@/lib/blog/posts';
import { BlogContent } from '@/components/blog/BlogContent';
import { BlogNav } from '@/components/blog/BlogNav';
import { BlogCard } from '@/components/blog/BlogCard';
import { BlogImage } from '@/components/blog/BlogImage';
import { Footer } from '@/components/landing/Footer';

interface BlogPostPageProps {
  params: { slug: string };
}

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export function generateMetadata({ params }: BlogPostPageProps): Metadata {
  const post = getPostBySlug(params.slug);
  if (!post) {
    return createMetadata({ title: 'Article not found', robots: { index: false, follow: true } });
  }

  // openGraph.images intentionally omitted so the per-post opengraph-image
  // file convention provides the cover for both OG and Twitter cards.
  return createMetadata({
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: 'article',
      locale: siteConfig.locale,
      url: `${siteConfig.url}/blog/${post.slug}`,
      siteName: siteConfig.name,
      title: post.title,
      description: post.description,
      publishedTime: new Date(post.publishedAt).toISOString(),
      modifiedTime: new Date(post.updatedAt).toISOString(),
      authors: [post.author.name],
      tags: post.keywords,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      site: siteConfig.twitterHandle,
      creator: siteConfig.creator,
    },
  });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  const related = getRelatedPosts(post.slug, 3);

  const schemas = [
    getOrganizationJsonLd(),
    getWebSiteJsonLd(),
    getBlogPostingJsonLd({
      title: post.title,
      description: post.description,
      slug: post.slug,
      image: getPostCoverPath(post.slug),
      datePublished: new Date(post.publishedAt).toISOString(),
      dateModified: new Date(post.updatedAt).toISOString(),
      authorName: post.author.name,
      keywords: post.keywords,
    }),
    getBreadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Blog', path: '/blog' },
      { name: post.title, path: `/blog/${post.slug}` },
    ]),
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

        <article className="mx-auto max-w-3xl px-6 pb-20 pt-12">
          <nav aria-label="Breadcrumb" className="mb-8 text-sm text-text-secondary">
            <Link href="/" className="hover:text-primary">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link href="/blog" className="hover:text-primary">
              Blog
            </Link>
            <span className="mx-2">/</span>
            <span className="text-text-primary">{post.category}</span>
          </nav>

          <header className="mb-8">
            <span className="badge badge-blue mb-4">{post.category}</span>
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-text-primary md:text-4xl">
              {post.title}
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-text-secondary">{post.excerpt}</p>

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-text-secondary">
              <span className="inline-flex items-center gap-1.5">
                <User className="h-4 w-4" />
                {post.author.name}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {post.readingMinutes} min read
              </span>
            </div>
          </header>

          <div className="mb-10 overflow-hidden rounded-2xl border border-border">
            <BlogImage
              src={post.coverImage}
              fallbackSrc={getPostCoverPath(post.slug)}
              alt={post.coverAlt}
              priority
              className="aspect-[1200/630] w-full object-cover"
            />
          </div>

          <BlogContent blocks={post.content} />

          <div className="mt-12 border-t border-border pt-8">
            <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
              <ArrowLeft className="h-4 w-4" />
              Back to all articles
            </Link>
          </div>
        </article>

        {related.length > 0 && (
          <section aria-label="Related articles" className="mx-auto max-w-5xl px-6 pb-24">
            <h2 className="mb-8 text-2xl font-bold tracking-tight text-text-primary">
              Related articles
            </h2>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <BlogCard key={p.slug} post={p} />
              ))}
            </div>
          </section>
        )}

        <Footer />
      </div>
    </>
  );
}
