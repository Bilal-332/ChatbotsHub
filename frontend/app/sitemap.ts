import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/seo';
import { getAllPosts } from '@/lib/blog/posts';

/**
 * XML sitemap.
 * Only indexable, canonical, public URLs are included.
 * Private/transactional routes (dashboard, chat widget, forgot/reset password)
 * are intentionally excluded and also disallowed in robots.ts.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${siteConfig.url}/`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${siteConfig.url}/blog`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${siteConfig.url}/auth/register`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    // Note: /auth/login is a thin, returning-user page — excluded from the
    // sitemap on purpose (still crawlable, but not a search landing target).
  ];

  const blogPosts: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${siteConfig.url}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [...staticPages, ...blogPosts];
}
