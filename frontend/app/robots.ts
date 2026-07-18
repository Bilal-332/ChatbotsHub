import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/seo';

/**
 * robots.txt
 * - Public marketing pages are crawlable.
 * - Private app (dashboard), the no-index chat widget, and transactional
 *   auth flows are blocked from crawling/indexing.
 * - Next.js asset/internal paths are blocked to preserve crawl budget.
 */
export default function robots(): MetadataRoute.Robots {
  const host = new URL(siteConfig.url).host;

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard',
          '/dashboard/',
          '/chat$',
          '/chat?',
          '/auth/forgot-password',
          '/auth/reset-password',
          '/api/',
          '/_next/',
        ],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host,
  };
}
