import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/seo';
import { getAllPosts } from '@/lib/blog/posts';
import { getAllSolutions } from '@/lib/landing/solutions';

/**
 * XML sitemap.
 * Only indexable, canonical, public URLs are included.
 * Private/transactional routes (dashboard, chat widget, forgot/reset password)
 * are intentionally excluded and also disallowed in robots.ts.
 */
// Fixed launch date used for stable, evergreen pages so their lastModified is
// a genuine signal rather than "now" on every build.
const SITE_LAUNCH = new Date('2026-01-14');

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();

  // Homepage/blog freshness tracks the most recently updated content instead of
  // resetting to the current time on every deploy.
  const contentLastModified = posts.reduce<Date>((latest, post) => {
    const updated = new Date(post.updatedAt);
    return updated > latest ? updated : latest;
  }, SITE_LAUNCH);

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${siteConfig.url}/`,
      lastModified: contentLastModified,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${siteConfig.url}/blog`,
      lastModified: contentLastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${siteConfig.url}/chatbot-for`,
      lastModified: SITE_LAUNCH,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${siteConfig.url}/auth/register`,
      lastModified: SITE_LAUNCH,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    // Note: /auth/login is a thin, returning-user page — excluded from the
    // sitemap on purpose (still crawlable, but not a search landing target).
  ];

  const blogPosts: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${siteConfig.url}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const solutionPages: MetadataRoute.Sitemap = getAllSolutions().map((solution) => ({
    url: `${siteConfig.url}/chatbot-for/${solution.slug}`,
    lastModified: SITE_LAUNCH,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  return [...staticPages, ...blogPosts, ...solutionPages];
}
