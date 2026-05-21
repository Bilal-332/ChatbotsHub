import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { AnimatedBackground } from '@/components/shared/AnimatedBackground';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'ChatbotsHub - Enterprise AI Knowledge Platform',
    template: '%s | ChatbotsHub',
  },
  description:
    'Deploy futuristic AI-powered chatbots trained on your enterprise knowledge base.',
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} dark`} style={{ scrollBehavior: 'smooth' }}>
      <body>
        <Providers>
          <AnimatedBackground />
          <div className="relative z-10">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
