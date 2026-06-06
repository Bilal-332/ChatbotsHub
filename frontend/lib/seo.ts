import type { Metadata } from 'next';

export const siteConfig = {
  name: 'ChatbotsHub',
  title: 'ChatbotsHub — AI Chatbot Platform for Your Documents',
  description:
    'ChatbotsHub lets you upload documents, train AI chatbots, embed them on your website, and test instantly. Build secure, multilingual AI assistants with vector search — free plan available.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://chatbotshub.me',
  creator: '@chatbotshub',
  keywords: [
    'ChatbotsHub',
    'chatbotshub',
    'AI chatbot',
    'AI chatbot platform',
    'document chatbot',
    'train chatbot on documents',
    'embeddable chatbot',
    'custom AI assistant',
    'RAG chatbot',
    'vector search chatbot',
    'SaaS chatbot builder',
    'enterprise AI chatbot',
    'multilingual chatbot',
    'chatbot API',
    'knowledge base chatbot',
  ],
} as const;

export function createMetadata(overrides?: Partial<Metadata>): Metadata {
  const title = siteConfig.title;
  const description = siteConfig.description;

  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: title,
      template: `%s | ${siteConfig.name}`,
    },
    description,
    keywords: [...siteConfig.keywords],
    authors: [{ name: siteConfig.name, url: siteConfig.url }],
    creator: siteConfig.name,
    publisher: siteConfig.name,
    applicationName: siteConfig.name,
    category: 'technology',
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: '/',
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: siteConfig.url,
      siteName: siteConfig.name,
      title,
      description,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: siteConfig.creator,
    },
    ...overrides,
  };
}

export function getOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/favicon.ico`,
    description: siteConfig.description,
    sameAs: [],
  };
}

export function getWebSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteConfig.url}/?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function getSoftwareApplicationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: siteConfig.name,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: siteConfig.url,
    description: siteConfig.description,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Free plan with document training and embeddable chatbot',
    },
    featureList: [
      'Document upload and AI training',
      'Embeddable chatbot widget',
      'REST API access',
      'Multilingual responses',
      'Custom branding and avatars',
    ],
  };
}

export function getFaqJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is ChatbotsHub?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'ChatbotsHub is an AI chatbot SaaS platform where you upload documents, train a chatbot on your knowledge base, embed it on your site, and test it with a direct link or API key.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I train a chatbot on my documents?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sign up, upload PDF, DOCX, or TXT files, and ChatbotsHub automatically chunks, embeds, and indexes your content for accurate AI-powered answers.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I embed the chatbot on my website?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. ChatbotsHub provides an embeddable script and API key so you can add the chatbot to any website in minutes.',
        },
      },
    ],
  };
}
