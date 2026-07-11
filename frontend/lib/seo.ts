import type { Metadata } from 'next';

export const siteConfig = {
  name: 'ChatbotsHub',
  // Optimized homepage title (≈58 chars) — leads with brand + primary keywords
  title: 'ChatbotsHub — AI Chatbot Platform & Builder for Websites',
  // Optimized meta description (≈158 chars) — keyword-rich, conversion-focused
  description:
    'ChatbotsHub is an AI chatbot platform and builder. Train custom AI chatbot software on your documents, embed a business chatbot on your website, and launch in minutes. Free plan available.',
  // Short tagline used for OG/Twitter when a page needs its own copy
  tagline: 'Build, train, and deploy custom AI chatbots for your website.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://chatbotshub.me',
  ogImage: '/opengraph-image',
  logo: '/icon.svg',
  creator: '@chatbotshub',
  twitterHandle: '@chatbotshub',
  locale: 'en_US',
  keywords: [
    'AI chatbot platform',
    'chatbot builder',
    'AI chatbot software',
    'custom AI chatbot',
    'business chatbot',
    'chatbot for website',
    'ChatbotsHub',
    'chatbotshub',
    'botshub',
    'chatbots hub',
    'chatbot hub',
    'Chatbot hub',
    'AI chatbot',
    'ai chatbot trained on documents',
    'ai chatbot trained on pdf',
    'ai chatbot trained on docx',
    'ai chatbot trained on txt',
    'ai chatbot trained on any document',
    'ai chatbot trained on website url', 'ai chatbot trained on website',
    'AI chatbot platform',
    'AI chatbot builder',
    'AI chatbot software',
    'AI chatbot for website',
    'AI chatbot for business',
    'AI chatbot for document',
    'AI chatbot for training',
    'AI chatbot for embedding',
    'document chatbot',
    'train chatbot on documents',
    'embeddable chatbot',
    'RAG chatbot',
    'knowledge base chatbot',
    'multilingual chatbot',
    'chatbot API',
  ],
} as const;

const GOOGLE_SITE_VERIFICATION = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

/**
 * Central metadata factory.
 *
 * Note: canonical is intentionally NOT defaulted here so child routes that
 * inherit root metadata do not all claim the homepage as their canonical.
 * Each indexable page should pass its own `alternates.canonical`.
 */
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
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
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
    ...(GOOGLE_SITE_VERIFICATION
      ? { verification: { google: GOOGLE_SITE_VERIFICATION } }
      : {}),
    openGraph: {
      type: 'website',
      locale: siteConfig.locale,
      url: siteConfig.url,
      siteName: siteConfig.name,
      title,
      description,
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: `${siteConfig.name} — AI chatbot platform and builder`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      site: siteConfig.twitterHandle,
      creator: siteConfig.creator,
      images: [siteConfig.ogImage],
    },
    ...overrides,
  };
}

const absoluteUrl = (path: string): string =>
  path.startsWith('http') ? path : `${siteConfig.url}${path.startsWith('/') ? path : `/${path}`}`;

export function getOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${siteConfig.url}/#organization`,
    name: siteConfig.name,
    legalName: 'ChatbotsHub',
    url: siteConfig.url,
    logo: {
      '@type': 'ImageObject',
      url: absoluteUrl(siteConfig.logo),
      width: 512,
      height: 512,
    },
    image: absoluteUrl(siteConfig.ogImage),
    description: siteConfig.description,
    foundingDate: '2025',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'support@chatbotshub.me',
      availableLanguage: ['English', 'Arabic', 'Urdu'],
    },
    // Public profiles strengthen entity/E-E-A-T signals. Add more (LinkedIn,
    // GitHub, YouTube) here as those accounts are created.
    sameAs: [
      'https://x.com/chatbotshub',
      'https://twitter.com/chatbotshub',
    ] as string[],
  };
}

export function getWebSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteConfig.url}/#website`,
    name: siteConfig.name,
    alternateName: ['AI Chatbot Hub', 'BotsHub' , 'ChatbotsHub' , 'Chatbot Hub', 'Chatbotshub' , 'botshub' , 'chatbots hub' , 'chatbot hub' , 'Chatbot hub' , 'AI chatbot' , 'ai chatbot trained on documents' , 'ai chatbot trained on pdf' , 'ai chatbot trained on docx' , 'ai chatbot trained on txt' , 'ai chatbot trained on any document' , 'ai chatbot trained on website url' , 'ai chatbot trained on website' , 'AI chatbot platform' , 'AI chatbot builder' , 'AI chatbot software' , 'AI chatbot for website' , 'AI chatbot for business' , 'AI chatbot for document' , 'AI chatbot for training' , 'AI chatbot for embedding' , 'document chatbot' , 'train chatbot on documents' , 'embeddable chatbot' , 'RAG chatbot' , 'knowledge base chatbot' , 'multilingual chatbot' , 'chatbot API' ],
    url: siteConfig.url,
    description: siteConfig.description,
    publisher: { '@id': `${siteConfig.url}/#organization` },
    inLanguage: 'en-US',
  };
}

export function getWebPageJsonLd(options?: {
  path?: string;
  title?: string;
  description?: string;
}) {
  const url = absoluteUrl(options?.path ?? '/');
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: options?.title ?? siteConfig.title,
    description: options?.description ?? siteConfig.description,
    isPartOf: { '@id': `${siteConfig.url}/#website` },
    about: { '@id': `${siteConfig.url}/#software` },
    primaryImageOfPage: absoluteUrl(siteConfig.ogImage),
    inLanguage: 'en-US',
  };
}

export function getSoftwareApplicationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': `${siteConfig.url}/#software`,
    name: siteConfig.name,
    applicationCategory: 'BusinessApplication',
    applicationSubCategory: 'AI Chatbot Platform',
    operatingSystem: 'Web',
    url: siteConfig.url,
    description: siteConfig.description,
    image: absoluteUrl(siteConfig.ogImage),
    softwareHelp: siteConfig.url,
    offers: [
      {
        '@type': 'Offer',
        name: 'Free',
        price: '0',
        priceCurrency: 'USD',
        description: 'Free plan with document training and an embeddable chatbot.',
      },
      {
        '@type': 'Offer',
        name: 'Starter',
        price: '25',
        priceCurrency: 'USD',
        description: 'Starter plan billed monthly for growing teams.',
      },
      {
        '@type': 'Offer',
        name: 'Pro',
        price: '80',
        priceCurrency: 'USD',
        description: 'Pro plan billed monthly for high-volume usage.',
      },
    ],
    featureList: [
      'Document upload and AI training',
      'Embeddable chatbot widget',
      'REST API access',
      'Multilingual responses (English, Arabic, Urdu)',
      'Custom branding and avatars',
      'Vector search powered answers',
    ],
  };
}

/**
 * Single source of truth for FAQ content.
 * The visible FAQ section (FaqSection.tsx) and the FAQPage JSON-LD both read
 * from this array, keeping them identical as Google Rich Results requires.
 */
export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'Is ChatbotsHub also known as BotsHub?',
    answer:
      'Yes, ChatbotsHub (often referred to by our community as BotsHub) is the definitive platform for building custom document-driven AI assistants.',
  },
  {
    question: 'What is ChatbotsHub?',
    answer:
      'ChatbotsHub is an AI chatbot platform and builder where you upload documents, train a custom AI chatbot on your knowledge base, embed it on your website, and test it with a direct link or API key.',
  },
  {
    question: 'How do I build an AI chatbot for my website?',
    answer:
      'Sign up, upload PDF, DOCX, or TXT files, and ChatbotsHub automatically chunks, embeds, and indexes your content. You then get an embeddable script and API key to add the business chatbot to any website.',
  },
  {
    question: 'Is there a free AI chatbot plan?',
    answer:
      'Yes. ChatbotsHub offers a free plan that includes document training and an embeddable chatbot, with paid Starter and Pro plans for higher message and document limits.',
  },
  {
    question: 'What documents can I train my chatbot on?',
    answer:
      'You can train your AI chatbot on PDF, DOCX, and TXT files. ChatbotsHub extracts the text, splits it into chunks, and stores vector embeddings so the chatbot can answer questions accurately from your own content.',
  },
  {
    question: 'Does ChatbotsHub support multiple languages?',
    answer:
      'Yes. The chatbot can understand and respond in multiple languages, including English, Arabic, and Urdu, so you can serve a global audience from a single knowledge base.',
  },
  {
    question: 'Do I need to write any code to add the chatbot?',
    answer:
      'No. ChatbotsHub gives you a ready-to-use embed script and an API key. Paste the script into your website to launch the chatbot, or call the REST API directly for custom integrations.',
  },
];

/**
 * FAQPage schema.
 * IMPORTANT (Google policy): FAQ rich results require the same FAQ Q&A to be
 * visibly present on the page — which they are, via FaqSection.tsx.
 */
export function getFaqJsonLd(items: FaqItem[] = FAQ_ITEMS) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

/**
 * BreadcrumbList generator for sub-pages (e.g. /blog, /blog/[slug]).
 */
export function getBreadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export interface BlogPostingJsonLdInput {
  title: string;
  description: string;
  slug: string;
  image: string;
  datePublished: string;
  dateModified: string;
  authorName: string;
  keywords: string[];
}

export function getBlogPostingJsonLd(post: BlogPostingJsonLdInput) {
  const url = absoluteUrl(`/blog/${post.slug}`);
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    headline: post.title,
    description: post.description,
    image: absoluteUrl(post.image),
    datePublished: post.datePublished,
    dateModified: post.dateModified,
    keywords: post.keywords.join(', '),
    inLanguage: 'en-US',
    author: {
      '@type': 'Organization',
      name: post.authorName,
      url: siteConfig.url,
    },
    publisher: { '@id': `${siteConfig.url}/#organization` },
  };
}

export function getBlogListingJsonLd(
  posts: { title: string; slug: string }[],
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': `${siteConfig.url}/blog#blog`,
    url: `${siteConfig.url}/blog`,
    name: `${siteConfig.name} Blog`,
    description:
      'Guides, tutorials, and insights on AI chatbots, chatbot builders, and AI chatbot software from ChatbotsHub.',
    isPartOf: { '@id': `${siteConfig.url}/#website` },
    publisher: { '@id': `${siteConfig.url}/#organization` },
    inLanguage: 'en-US',
    blogPost: posts.map((p) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      url: absoluteUrl(`/blog/${p.slug}`),
    })),
  };
}
