import { ImageResponse } from 'next/og';
import { siteConfig } from '@/lib/seo';

export const runtime = 'edge';
export const alt = 'ChatbotsHub — AI chatbot platform and builder for websites';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          backgroundColor: '#060816',
          backgroundImage:
            'radial-gradient(circle at 20% 0%, rgba(91,108,255,0.35) 0%, transparent 45%), radial-gradient(circle at 90% 100%, rgba(124,77,255,0.30) 0%, transparent 45%)',
          color: '#F5F7FF',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            marginBottom: 40,
          }}
        >
          <div
            style={{
            width: 72,
            height: 72,
            borderRadius: 20,
            backgroundImage: 'linear-gradient(135deg, #5B6CFF, #7C4DFF)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 44,
            fontWeight: 800,
            color: '#FFFFFF',
          }}
        >
          C
        </div>
        <div style={{ display: 'flex', fontSize: 40, fontWeight: 700 }}>
          Chatbots<span style={{ color: '#8FA0FF' }}>Hub</span>
        </div>
        </div>

        <div
          style={{
            fontSize: 76,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            maxWidth: 1000,
          }}
        >
          AI Chatbot Platform & Builder for Your Website
        </div>

        <div
          style={{
            display: 'flex',
            marginTop: 32,
            fontSize: 32,
            color: '#A8B0CF',
            maxWidth: 920,
          }}
        >
          {`${siteConfig.tagline} Train on your documents. Embed anywhere. Launch in minutes.`}
        </div>
      </div>
    ),
    { ...size },
  );
}
