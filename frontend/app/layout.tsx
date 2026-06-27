import type { Metadata } from 'next';
import { Inter, Inter_Tight, Suez_One } from 'next/font/google';
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

export const metadata: Metadata = createMetadata();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${interTight.variable} ${suezOne.variable} dark`}
    >
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
