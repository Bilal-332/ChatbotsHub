import { getAllPosts } from '@/lib/blog/posts';
import { siteConfig } from '@/lib/seo';

// Static RSS 2.0 feed for the blog. Rebuilt with the site; feed readers and
// search engines can discover it via the <link rel="alternate"> tags in <head>.
export const dynamic = 'force-static';

function escapeXml(value: string): string {
  return value.replace(/[<>&'"]/g, (char) => {
    switch (char) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case "'":
        return '&apos;';
      case '"':
        return '&quot;';
      default:
        return char;
    }
  });
}

export function GET(): Response {
  const posts = getAllPosts();
  const feedUrl = `${siteConfig.url}/feed.xml`;
  const lastBuildDate = posts.length
    ? new Date(posts[0]!.updatedAt).toUTCString()
    : new Date().toUTCString();

  const items = posts
    .map((post) => {
      const url = `${siteConfig.url}/blog/${post.slug}`;
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(post.description)}</description>
      <category>${escapeXml(post.category)}</category>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteConfig.name)} Blog</title>
    <link>${siteConfig.url}/blog</link>
    <description>Guides, tutorials, and insights on AI chatbots, chatbot builders, and AI chatbot software from ${escapeXml(
      siteConfig.name,
    )}.</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
