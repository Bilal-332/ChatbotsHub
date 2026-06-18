import { ImageResponse } from 'next/og';
import { getPostBySlug } from '@/lib/blog/posts';

// Edge runtime: @vercel/og bundles fonts here (the Node runtime hits a
// Windows font-path bug). Generated on-demand per slug and cached.
export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'ChatbotsHub blog article cover';

// rgba tuples so Satori parses gradient stops reliably (no bare hex in background)
const ACCENTS: Record<string, [string, string]> = {
  Guides: ['91,108,255', '124,77,255'],
  Tutorials: ['45,212,191', '91,108,255'],
  Comparisons: ['245,158,11', '124,77,255'],
  Business: ['34,197,94', '91,108,255'],
  Technology: ['124,77,255', '236,72,153'],
  Features: ['91,108,255', '34,211,238'],
  'Use Cases': ['244,114,182', '124,77,255'],
};

export default function BlogOgImage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  const title = post?.title ?? 'ChatbotsHub Blog';
  const category = post?.category ?? 'Blog';
  const [c1, c2] = ACCENTS[category] ?? ['91,108,255', '124,77,255'];

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px',
          backgroundColor: '#060816',
          backgroundImage: `radial-gradient(circle at 12% 0%, rgba(${c1},0.33) 0%, transparent 45%), radial-gradient(circle at 95% 100%, rgba(${c2},0.30) 0%, transparent 45%)`,
          color: '#F5F7FF',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div
            style={{
              display: 'flex',
              width: 60,
              height: 60,
              borderRadius: 16,
              backgroundImage: `linear-gradient(135deg, rgba(${c1},1), rgba(${c2},1))`,
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 36,
              fontWeight: 800,
              color: '#FFFFFF',
            }}
          >
            C
          </div>
          <div style={{ display: 'flex', fontSize: 32, fontWeight: 700 }}>
            Chatbots<span style={{ color: '#8FA0FF' }}>Hub</span>
          </div>
          <div
            style={{
              display: 'flex',
              marginLeft: 'auto',
              fontSize: 22,
              fontWeight: 600,
              color: '#0B0E1F',
              backgroundImage: `linear-gradient(135deg, rgba(${c1},1), rgba(${c2},1))`,
              padding: '10px 22px',
              borderRadius: 999,
            }}
          >
            {category}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            fontSize: title.length > 60 ? 58 : 68,
            fontWeight: 800,
            lineHeight: 1.08,
            letterSpacing: '-0.02em',
            maxWidth: 1050,
          }}
        >
          {title}
        </div>

        <div style={{ display: 'flex', fontSize: 28, color: '#A8B0CF' }}>chatbotshub.me/blog</div>
      </div>
    ),
    { ...size },
  );
}
