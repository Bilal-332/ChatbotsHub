import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/seo';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.title,
    short_name: siteConfig.name,
    description: siteConfig.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#060816',
    theme_color: '#5B6CFF',
    categories: ['business', 'productivity', 'developer'],
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
  };
}
