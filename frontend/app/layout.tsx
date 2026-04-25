import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'ChatbotsHub - AI Knowledge Chatbot SaaS',
    template: '%s | ChatbotsHub',
  },
  description:
    'Upload documents and deploy AI-powered chatbots trained on your content. No code required.',
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} style={{ scrollBehavior: 'smooth' }}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
