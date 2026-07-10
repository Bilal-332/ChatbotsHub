import type { Metadata } from 'next';
import { Inter, Inter_Tight, Suez_One, Noto_Sans_Arabic, Noto_Nastaliq_Urdu } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { createMetadata } from '@/lib/seo';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
});

const interTight = Inter_Tight({
  subsets: ['latin'],
  variable: '--font-inter-tight',
  display: 'swap',
  preload: true,
});

// Bold, distinctive display font used for the ChatbotsHub wordmark/logo.
// Suez One ships a single heavy weight (400), which is already bold by design.
const suezOne = Suez_One({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-logo',
  display: 'swap',
  preload: true,
});

// RTL fonts used only for Arabic/Urdu chat responses. Self-hosted and NOT
// preloaded, so they never block render and are fetched only when Arabic/Urdu
// text is actually displayed (replaces the render-blocking Google Fonts @import).
const notoArabic = Noto_Sans_Arabic({
  weight: ['400', '600'],
  variable: '--font-noto-arabic',
  display: 'swap',
  preload: false,
});

const notoUrdu = Noto_Nastaliq_Urdu({
  weight: ['400', '600'],
  variable: '--font-noto-urdu',
  display: 'swap',
  preload: false,
});

export const metadata: Metadata = createMetadata({
  alternates: {
    types: { 'application/rss+xml': '/feed.xml' },
  },
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${interTight.variable} ${suezOne.variable} ${notoArabic.variable} ${notoUrdu.variable} dark`}
    >
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
