import { siteConfig } from '@/lib/seo';

export type ContentBlock =
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'quote'; text: string }
  | { type: 'cta'; label: string; href: string; text?: string };

export interface BlogAuthor {
  name: string;
  role: string;
}

export interface BlogPost {
  slug: string;
  /** Primary cover/thumbnail photo. Falls back to the generated OG cover if it fails to load. */
  coverImage: string;
  title: string;
  description: string;
  excerpt: string;
  category: string;
  keywords: string[];
  author: BlogAuthor;
  publishedAt: string; // ISO date
  updatedAt: string; // ISO date
  readingMinutes: number;
  coverAlt: string;
  content: ContentBlock[];
}

const AUTHOR: BlogAuthor = {
  name: 'ChatbotsHub Team',
  role: 'AI & Product',
};

/**
 * Inline link convention used inside `p` and list items:
 *   [label](/path)  — rendered as a real anchor by BlogContent.
 * Cross-links between posts and to /auth/register power internal-linking SEO.
 */
export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'what-is-an-ai-chatbot-platform',
    coverImage:
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80',
    title: 'What Is an AI Chatbot Platform? A Complete Guide for 2026',
    description:
      'An AI chatbot platform lets you build, train, and deploy intelligent chatbots without code. Learn how AI chatbot software works and how to choose the right one.',
    excerpt:
      'Everything you need to know about AI chatbot platforms — how they work, what to look for, and how to launch your first chatbot fast.',
    category: 'Guides',
    keywords: [
      'AI chatbot platform',
      'AI chatbot software',
      'chatbot builder',
      'what is an AI chatbot',
    ],
    author: AUTHOR,
    publishedAt: '2026-01-14',
    updatedAt: '2026-01-14',
    readingMinutes: 7,
    coverAlt: 'Illustration of an AI chatbot platform dashboard with chat bubbles',
    content: [
      {
        type: 'p',
        text: 'An **AI chatbot platform** is software that lets you build, train, and deploy intelligent chatbots that can hold natural conversations with your users. Instead of writing rigid decision trees, you connect your own knowledge — documents, FAQs, product data — and the platform turns it into a chatbot that answers questions accurately, 24/7.',
      },
      {
        type: 'p',
        text: 'In 2026, AI chatbots have moved from a "nice to have" widget to a core part of customer experience. This guide explains what an AI chatbot platform actually does, the technology behind it, and how to pick one that fits your business.',
      },
      { type: 'h2', text: 'How an AI chatbot platform works' },
      {
        type: 'p',
        text: 'Modern platforms like [ChatbotsHub](/) use a technique called Retrieval-Augmented Generation (RAG). At a high level, the workflow looks like this:',
      },
      {
        type: 'ol',
        items: [
          'You upload your documents (PDF, DOCX, TXT) or connect your knowledge base.',
          'The platform splits the text into chunks and converts each chunk into a vector embedding.',
          'When a user asks a question, the platform finds the most relevant chunks using vector search.',
          'A large language model (LLM) writes a natural answer grounded in those chunks.',
        ],
      },
      {
        type: 'p',
        text: 'Want a deeper dive into the retrieval step? Read our explainer on [what RAG is and why it makes chatbots smarter](/blog/what-is-rag-retrieval-augmented-generation).',
      },
      { type: 'h2', text: 'Key features to look for' },
      {
        type: 'ul',
        items: [
          '**Document training** — upload your own files and train without code.',
          '**Embeddable widget** — drop a script tag on any website.',
          '**API access** — integrate the chatbot into apps and workflows.',
          '**Multilingual support** — answer in your customers’ language.',
          '**Custom branding** — match your colors, name, and avatar.',
          '**Usage analytics & limits** — understand and control costs.',
        ],
      },
      { type: 'h2', text: 'Who should use an AI chatbot platform?' },
      {
        type: 'p',
        text: 'Support teams use them to deflect repetitive tickets. Marketing teams use them to capture and qualify leads. Internal teams use them to surface knowledge buried in documents. If you have content and an audience, a chatbot helps.',
      },
      {
        type: 'quote',
        text: 'The best AI chatbot platform is the one that turns your existing knowledge into accurate answers with the least setup.',
      },
      { type: 'h2', text: 'Getting started' },
      {
        type: 'p',
        text: 'With ChatbotsHub you can upload a document, train a chatbot, and get an embeddable script plus a testing link in minutes. There is a free plan to try it with no credit card.',
      },
      {
        type: 'cta',
        label: 'Build your free AI chatbot',
        href: '/auth/register',
        text: 'Ready to see it in action?',
      },
    ],
  },
  {
    slug: 'how-to-build-an-ai-chatbot-for-your-website',
    coverImage:
      'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80',
    title: 'How to Build an AI Chatbot for Your Website (No Code Required)',
    description:
      'Learn how to build an AI chatbot for your website with no code. Upload documents, train your chatbot, and embed it in minutes with ChatbotsHub.',
    excerpt:
      'A step-by-step, no-code guide to building an AI chatbot for your website and embedding it anywhere.',
    category: 'Tutorials',
    keywords: [
      'chatbot builder',
      'chatbot for website',
      'build AI chatbot',
      'no code chatbot',
    ],
    author: AUTHOR,
    publishedAt: '2026-01-22',
    updatedAt: '2026-01-22',
    readingMinutes: 6,
    coverAlt: 'Step-by-step illustration of building a chatbot for a website',
    content: [
      {
        type: 'p',
        text: 'You don’t need to be a developer to add a smart **chatbot to your website**. With a no-code [AI chatbot platform](/blog/what-is-an-ai-chatbot-platform), you can go from raw documents to a live, trained assistant in a single afternoon. Here’s exactly how.',
      },
      { type: 'h2', text: 'Step 1 — Create your workspace' },
      {
        type: 'p',
        text: 'Sign up for a free ChatbotsHub account. Each account gets a workspace with default chatbot settings — name, welcome message, and brand color — that you can customize later.',
      },
      { type: 'h2', text: 'Step 2 — Upload your knowledge' },
      {
        type: 'p',
        text: 'Upload the documents your chatbot should learn from. ChatbotsHub supports PDF, DOCX, and TXT. The platform automatically extracts text, chunks it, and indexes it for fast retrieval. For best results, see our guide on [training a chatbot on your documents](/blog/how-to-train-a-chatbot-on-your-documents).',
      },
      { type: 'h2', text: 'Step 3 — Customize the experience' },
      {
        type: 'ul',
        items: [
          'Set the chatbot name and a friendly welcome message.',
          'Upload a custom avatar and choose your brand color.',
          'Pick a response language or let it auto-detect.',
          'Write a fallback message for questions outside your knowledge.',
        ],
      },
      { type: 'h2', text: 'Step 4 — Embed it on your site' },
      {
        type: 'p',
        text: 'Copy your embed script and paste it before the closing body tag of your website. The floating chat widget appears instantly. Prefer a faster walkthrough? Read [how to add a chatbot to your website in 5 minutes](/blog/add-a-chatbot-to-your-website-in-5-minutes).',
      },
      { type: 'h2', text: 'Step 5 — Test and iterate' },
      {
        type: 'p',
        text: 'Use the direct testing link to chat with your bot, find gaps, and upload more documents. The more relevant content you add, the better the answers become.',
      },
      {
        type: 'cta',
        label: 'Start building for free',
        href: '/auth/register',
        text: 'No credit card required.',
      },
    ],
  },
  {
    slug: 'how-to-train-a-chatbot-on-your-documents',
    coverImage:
      'https://images.unsplash.com/photo-1526925539332-aa3b66e35444?auto=format&fit=crop&w=1200&q=80',
    title: 'How to Train a Chatbot on Your Own Documents (PDF, DOCX, TXT)',
    description:
      'Learn how to train an AI chatbot on your own documents. Tips for chunking, clean PDFs, and accurate answers from your knowledge base.',
    excerpt:
      'Turn your PDFs, docs, and text files into an accurate AI chatbot — with practical tips to get the best answers.',
    category: 'Tutorials',
    keywords: [
      'train chatbot on documents',
      'document chatbot',
      'knowledge base chatbot',
      'PDF chatbot',
    ],
    author: AUTHOR,
    publishedAt: '2026-02-03',
    updatedAt: '2026-02-03',
    readingMinutes: 8,
    coverAlt: 'Documents being transformed into an AI chatbot knowledge base',
    content: [
      {
        type: 'p',
        text: 'The quality of an AI chatbot comes down to one thing: the knowledge you train it on. The good news is that **training a chatbot on your own documents** is straightforward when you follow a few best practices.',
      },
      { type: 'h2', text: 'What file types can you use?' },
      {
        type: 'p',
        text: 'ChatbotsHub supports PDF, DOCX, and TXT. Text-based PDFs work best. Scanned PDFs are processed with OCR, but clean, selectable text always produces more accurate answers.',
      },
      { type: 'h2', text: 'How training actually works' },
      {
        type: 'p',
        text: 'When you upload a file, the platform extracts the text, splits it into overlapping chunks, generates vector embeddings, and stores them in a vector database. At question time it retrieves the most relevant chunks and feeds them to the language model. This is the [RAG technique](/blog/what-is-rag-retrieval-augmented-generation) in action.',
      },
      { type: 'h2', text: 'Tips for better answers' },
      {
        type: 'ul',
        items: [
          'Use clear headings and sections — they improve chunk quality.',
          'Prefer text-based PDFs over scanned images.',
          'Remove duplicate or outdated documents to avoid conflicting answers.',
          'Split very large manuals into focused files by topic.',
          'Add an FAQ document that mirrors how customers actually ask questions.',
        ],
      },
      { type: 'h3', text: 'Keep your knowledge fresh' },
      {
        type: 'p',
        text: 'Treat your chatbot like a living product. When your docs change, re-upload them. Outdated content is the most common cause of wrong answers.',
      },
      {
        type: 'quote',
        text: 'Garbage in, garbage out — clean, well-structured documents are the single biggest lever for chatbot accuracy.',
      },
      { type: 'h2', text: 'From documents to a live chatbot' },
      {
        type: 'p',
        text: 'Once your documents are processed, you can embed the chatbot on your site or query it via API. New to the platform? Start with [how to build an AI chatbot for your website](/blog/how-to-build-an-ai-chatbot-for-your-website).',
      },
      {
        type: 'cta',
        label: 'Train your first chatbot',
        href: '/auth/register',
        text: 'Upload a document and see the difference.',
      },
    ],
  },
  {
    slug: 'custom-ai-chatbot-vs-generic-chatbots',
    coverImage:
      'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
    title: 'Custom AI Chatbot vs. Generic Chatbots: Which Is Right for You?',
    description:
      'Compare custom AI chatbots trained on your data with generic chatbots. Learn the accuracy, branding, and trust advantages of a custom AI chatbot.',
    excerpt:
      'Generic bots guess. Custom AI chatbots know your business. Here’s why training on your own data wins.',
    category: 'Comparisons',
    keywords: [
      'custom AI chatbot',
      'AI chatbot software',
      'business chatbot',
      'chatbot comparison',
    ],
    author: AUTHOR,
    publishedAt: '2026-02-15',
    updatedAt: '2026-02-15',
    readingMinutes: 6,
    coverAlt: 'Comparison between a custom AI chatbot and a generic chatbot',
    content: [
      {
        type: 'p',
        text: 'Not all chatbots are created equal. A generic chatbot answers from broad, public knowledge. A **custom AI chatbot** answers from *your* knowledge — your products, policies, and documentation. That difference changes everything.',
      },
      { type: 'h2', text: 'Accuracy and trust' },
      {
        type: 'p',
        text: 'Generic models can hallucinate or give answers that don’t match your business. A custom chatbot grounded in your documents stays on-topic and cites your real content, which builds user trust.',
      },
      { type: 'h2', text: 'Branding and experience' },
      {
        type: 'ul',
        items: [
          'Custom name, avatar, and brand colors that match your site.',
          'Tailored welcome and fallback messages.',
          'Consistent tone aligned with your company voice.',
        ],
      },
      { type: 'h2', text: 'Control and privacy' },
      {
        type: 'p',
        text: 'With a custom chatbot you decide exactly what knowledge it can use. Each workspace is isolated, so your data only powers your bot. Learn how this works in our [guide to knowledge base chatbots](/blog/knowledge-base-chatbot).',
      },
      { type: 'h2', text: 'When is a generic chatbot enough?' },
      {
        type: 'p',
        text: 'For casual, open-ended chat with no business-specific requirements, a generic assistant is fine. But the moment you need accurate answers about your offering, a custom AI chatbot is the right call.',
      },
      {
        type: 'quote',
        text: 'A generic chatbot sounds smart. A custom AI chatbot is actually right about your business.',
      },
      {
        type: 'cta',
        label: 'Create your custom chatbot',
        href: '/auth/register',
        text: 'Trained on your data, branded as you.',
      },
    ],
  },
  {
    slug: 'business-chatbot-benefits',
    coverImage:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    title: '10 Ways a Business Chatbot Can Grow Your Revenue',
    description:
      'Discover 10 ways a business chatbot grows revenue — from 24/7 support and lead capture to higher conversions and lower support costs.',
    excerpt:
      'A business chatbot is more than support automation. Here are 10 concrete ways it drives revenue.',
    category: 'Business',
    keywords: [
      'business chatbot',
      'chatbot for website',
      'AI chatbot platform',
      'chatbot ROI',
    ],
    author: AUTHOR,
    publishedAt: '2026-02-27',
    updatedAt: '2026-02-27',
    readingMinutes: 7,
    coverAlt: 'A business chatbot driving sales and support growth',
    content: [
      {
        type: 'p',
        text: 'A **business chatbot** does far more than answer FAQs. When it’s trained on your real content, it becomes a always-on team member that supports, sells, and qualifies. Here are ten ways it moves the needle.',
      },
      { type: 'h2', text: '1–5: Win more customers' },
      {
        type: 'ol',
        items: [
          'Answer pre-sales questions instantly so buyers don’t bounce.',
          'Capture and qualify leads around the clock.',
          'Recommend the right product or plan based on user needs.',
          'Reduce cart and signup abandonment with timely help.',
          'Engage international visitors with multilingual replies.',
        ],
      },
      { type: 'h2', text: '6–10: Lower costs and scale' },
      {
        type: 'ol',
        items: [
          'Deflect repetitive support tickets automatically.',
          'Free your team to focus on complex, high-value cases.',
          'Provide consistent answers that never go off-script.',
          'Scale support without scaling headcount.',
          'Surface knowledge gaps from real user questions.',
        ],
      },
      { type: 'h2', text: 'Make it multilingual' },
      {
        type: 'p',
        text: 'If you serve a global audience, language is a revenue lever. See how [multilingual AI chatbots](/blog/multilingual-ai-chatbots) help you support customers in Arabic, Urdu, and English.',
      },
      {
        type: 'quote',
        text: 'Every unanswered question is a potential lost customer. A business chatbot closes that gap 24/7.',
      },
      {
        type: 'cta',
        label: 'Launch your business chatbot',
        href: '/auth/register',
        text: 'Start free and measure the impact.',
      },
    ],
  },
  {
    slug: 'what-is-rag-retrieval-augmented-generation',
    coverImage:
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    title: 'What Is RAG (Retrieval-Augmented Generation)? Why It Makes Chatbots Smarter',
    description:
      'RAG (Retrieval-Augmented Generation) grounds AI chatbots in your real data for accurate answers. Learn how RAG works and why it reduces hallucinations.',
    excerpt:
      'RAG is the technique that makes AI chatbots accurate. Here’s how retrieval-augmented generation works in plain English.',
    category: 'Technology',
    keywords: [
      'RAG chatbot',
      'retrieval augmented generation',
      'vector search chatbot',
      'AI chatbot platform',
    ],
    author: AUTHOR,
    publishedAt: '2026-03-10',
    updatedAt: '2026-03-10',
    readingMinutes: 8,
    coverAlt: 'Diagram of retrieval-augmented generation powering a chatbot',
    content: [
      {
        type: 'p',
        text: '**Retrieval-Augmented Generation (RAG)** is the technique behind accurate, trustworthy AI chatbots. Instead of relying only on what a language model memorized during training, RAG retrieves relevant facts from *your* documents and uses them to write the answer.',
      },
      { type: 'h2', text: 'The problem RAG solves' },
      {
        type: 'p',
        text: 'Large language models can sound confident while being wrong — a behavior called hallucination. They also don’t know your private, up-to-date business content. RAG fixes both by grounding answers in retrieved, real data.',
      },
      { type: 'h2', text: 'How RAG works, step by step' },
      {
        type: 'ol',
        items: [
          'Your documents are split into chunks and converted into vector embeddings.',
          'Embeddings are stored in a vector database.',
          'A user question is also embedded, then matched against the chunks.',
          'The most relevant chunks are retrieved and ranked.',
          'The language model writes an answer using only those chunks as context.',
        ],
      },
      { type: 'h3', text: 'Why vectors matter' },
      {
        type: 'p',
        text: 'Vector search finds results by meaning, not just keywords. So a user can ask “how do I cancel?” and still match a document section titled “Ending your subscription.”',
      },
      { type: 'h2', text: 'RAG in ChatbotsHub' },
      {
        type: 'p',
        text: 'ChatbotsHub runs a full RAG pipeline for you: extraction, chunking, embeddings, vector search, re-ranking, and grounded generation. You just upload documents — see [how to train a chatbot on your documents](/blog/how-to-train-a-chatbot-on-your-documents).',
      },
      {
        type: 'quote',
        text: 'RAG turns a general-purpose model into a specialist that actually knows your business.',
      },
      {
        type: 'cta',
        label: 'Try a RAG-powered chatbot',
        href: '/auth/register',
        text: 'Accurate answers, grounded in your data.',
      },
    ],
  },
  {
    slug: 'add-a-chatbot-to-your-website-in-5-minutes',
    coverImage:
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
    title: 'How to Add a Chatbot to Your Website in 5 Minutes',
    description:
      'Add an AI chatbot to your website in 5 minutes with a simple embed script. Works on any site — HTML, WordPress, Shopify, and more.',
    excerpt:
      'A fast, copy-paste guide to embedding an AI chatbot on any website in about five minutes.',
    category: 'Tutorials',
    keywords: [
      'chatbot for website',
      'embeddable chatbot',
      'add chatbot to website',
      'chatbot widget',
    ],
    author: AUTHOR,
    publishedAt: '2026-03-21',
    updatedAt: '2026-03-21',
    readingMinutes: 5,
    coverAlt: 'Embedding a chatbot widget script into a website',
    content: [
      {
        type: 'p',
        text: 'Adding an AI **chatbot to your website** is a copy-paste job. If you can paste a script tag, you can launch a chatbot. Here’s the five-minute version.',
      },
      { type: 'h2', text: 'Before you start' },
      {
        type: 'p',
        text: 'You’ll need a trained chatbot. If you haven’t built one yet, follow [how to build an AI chatbot for your website](/blog/how-to-build-an-ai-chatbot-for-your-website) first — it only takes a few minutes.',
      },
      { type: 'h2', text: 'Step 1 — Copy your embed script' },
      {
        type: 'p',
        text: 'In your dashboard, open the API & Integration page and copy the widget snippet. It includes your unique API key, so the widget loads the right chatbot.',
      },
      { type: 'h2', text: 'Step 2 — Paste it on your site' },
      {
        type: 'ul',
        items: [
          '**HTML site:** paste the script before the closing body tag.',
          '**WordPress:** add it to your theme footer or a custom HTML block.',
          '**Shopify:** add it to theme.liquid before the closing body tag.',
          '**Framer / Webflow:** use a custom code / embed component.',
        ],
      },
      { type: 'h2', text: 'Step 3 — Test it live' },
      {
        type: 'p',
        text: 'Refresh your site and the floating chat button appears. You can also share the direct testing link to gather feedback before going public.',
      },
      {
        type: 'quote',
        text: 'One script tag is all that stands between your visitors and instant, accurate answers.',
      },
      {
        type: 'cta',
        label: 'Get your embed script',
        href: '/auth/register',
        text: 'Create a chatbot and copy your snippet.',
      },
    ],
  },
  {
    slug: 'multilingual-ai-chatbots',
    coverImage:
      'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80',
    title: 'Multilingual AI Chatbots: Serve Customers in Arabic, Urdu & English',
    description:
      'Multilingual AI chatbots let you answer customers in Arabic, Urdu, English, and more — from a single knowledge base. Here’s how it works.',
    excerpt:
      'Reach a global audience with a chatbot that understands and replies in your customers’ language.',
    category: 'Features',
    keywords: [
      'multilingual chatbot',
      'Arabic chatbot',
      'Urdu chatbot',
      'AI chatbot platform',
    ],
    author: AUTHOR,
    publishedAt: '2026-04-02',
    updatedAt: '2026-04-02',
    readingMinutes: 6,
    coverAlt: 'A chatbot responding in multiple languages including Arabic and Urdu',
    content: [
      {
        type: 'p',
        text: 'Your customers don’t all speak the same language — and your chatbot shouldn’t either. A **multilingual AI chatbot** can understand a question in one language and respond naturally in that same language, all from a single knowledge base.',
      },
      { type: 'h2', text: 'How multilingual answers work' },
      {
        type: 'p',
        text: 'ChatbotsHub detects the language of the question, retrieves the relevant knowledge, generates the answer, and returns it in the user’s language — including right-to-left scripts like Arabic and Urdu with correct fonts.',
      },
      { type: 'h2', text: 'Why it matters for growth' },
      {
        type: 'ul',
        items: [
          'Serve regional audiences without translating your whole site.',
          'Increase trust by meeting users in their native language.',
          'Reduce support load across multiple markets at once.',
          'Maintain one source of truth instead of separate bots per language.',
        ],
      },
      { type: 'h2', text: 'One knowledge base, many languages' },
      {
        type: 'p',
        text: 'You upload your documents once. The chatbot bridges the language gap at query time, so you don’t maintain duplicate content. This pairs perfectly with the revenue benefits in [10 ways a business chatbot grows revenue](/blog/business-chatbot-benefits).',
      },
      {
        type: 'quote',
        text: 'Speaking your customer’s language isn’t a feature — it’s a competitive advantage.',
      },
      {
        type: 'cta',
        label: 'Launch a multilingual chatbot',
        href: '/auth/register',
        text: 'English, Arabic, Urdu, and more.',
      },
    ],
  },
  {
    slug: 'ai-chatbot-pricing-guide',
    coverImage:
      'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=1200&q=80',
    title: 'AI Chatbot Pricing Explained: How to Choose the Right Plan',
    description:
      'Understand AI chatbot pricing — message limits, document limits, and features — so you choose the right plan. Includes a free plan comparison.',
    excerpt:
      'Confused by chatbot pricing? Here’s how to read message limits, document limits, and features to pick the right plan.',
    category: 'Guides',
    keywords: [
      'AI chatbot software',
      'chatbot pricing',
      'AI chatbot platform',
      'chatbot plans',
    ],
    author: AUTHOR,
    publishedAt: '2026-04-16',
    updatedAt: '2026-04-16',
    readingMinutes: 6,
    coverAlt: 'Comparing AI chatbot pricing plans and limits',
    content: [
      {
        type: 'p',
        text: 'AI chatbot pricing can look confusing because vendors measure different things. Once you know what the numbers mean, choosing the right plan is simple. Here’s how to read **AI chatbot software** pricing.',
      },
      { type: 'h2', text: 'The metrics that matter' },
      {
        type: 'ul',
        items: [
          '**Messages per month** — how many questions your chatbot can answer.',
          '**Document limits** — how much knowledge you can train it on.',
          '**File size limits** — the largest files you can upload.',
          '**Features** — branding, avatars, multilingual, API access.',
        ],
      },
      { type: 'h2', text: 'Match the plan to your stage' },
      {
        type: 'ol',
        items: [
          'Just testing? Start on the free plan with no credit card.',
          'Growing site or small business? A Starter plan adds higher limits.',
          'High traffic or many documents? A Pro plan scales with you.',
        ],
      },
      { type: 'h2', text: 'Don’t overpay for unused capacity' },
      {
        type: 'p',
        text: 'Estimate your monthly message volume from current support and sales traffic. Start smaller — you can upgrade as usage grows. Curious what drives that volume? See [10 ways a business chatbot grows revenue](/blog/business-chatbot-benefits).',
      },
      {
        type: 'quote',
        text: 'Pick the smallest plan that comfortably covers your real usage — then scale on demand.',
      },
      {
        type: 'cta',
        label: 'Start on the free plan',
        href: '/auth/register',
        text: 'Upgrade only when you need to.',
      },
    ],
  },
  {
    slug: 'knowledge-base-chatbot',
    coverImage:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    title: 'Knowledge Base Chatbots: Turn Your Docs into 24/7 Support',
    description:
      'A knowledge base chatbot turns your help docs into instant, 24/7 support. Learn how to deflect tickets and improve answers with a doc-trained chatbot.',
    excerpt:
      'Your help docs already hold the answers. A knowledge base chatbot delivers them instantly, around the clock.',
    category: 'Use Cases',
    keywords: [
      'knowledge base chatbot',
      'document chatbot',
      'support chatbot',
      'AI chatbot platform',
    ],
    author: AUTHOR,
    publishedAt: '2026-04-29',
    updatedAt: '2026-04-29',
    readingMinutes: 7,
    coverAlt: 'A knowledge base being converted into a 24/7 support chatbot',
    content: [
      {
        type: 'p',
        text: 'Most teams already have the answers — buried in help docs, PDFs, and wikis. A **knowledge base chatbot** unlocks that content and delivers it as instant, conversational support, 24/7.',
      },
      { type: 'h2', text: 'Why a knowledge base chatbot beats a search box' },
      {
        type: 'p',
        text: 'A search box returns a list of links and makes users do the work. A chatbot reads the relevant sections and gives a direct answer — often resolving the question in one reply.',
      },
      { type: 'h2', text: 'What you can automate' },
      {
        type: 'ul',
        items: [
          'Onboarding and setup questions.',
          'Billing, plans, and policy questions.',
          'Troubleshooting steps from your help docs.',
          'Product “how do I…” questions.',
        ],
      },
      { type: 'h2', text: 'How to set it up' },
      {
        type: 'p',
        text: 'Export your help center or upload your docs, train the chatbot, and embed it. The full process is covered in [how to train a chatbot on your documents](/blog/how-to-train-a-chatbot-on-your-documents) and [how to build an AI chatbot for your website](/blog/how-to-build-an-ai-chatbot-for-your-website).',
      },
      { type: 'h3', text: 'Close the loop' },
      {
        type: 'p',
        text: 'Review real questions to find missing content, then add documents to cover the gaps. Your chatbot gets smarter every week.',
      },
      {
        type: 'quote',
        text: 'Your knowledge base shouldn’t sit idle — a chatbot turns it into a 24/7 support agent.',
      },
      {
        type: 'cta',
        label: 'Turn your docs into a chatbot',
        href: '/auth/register',
        text: 'Deflect tickets and delight users.',
      },
    ],
  },
  {
    slug: 'train-chatbot-from-website-url',
    coverImage:
      'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?auto=format&fit=crop&w=1200&q=80',
    title: 'How to Train Your AI Chatbot from a Website URL',
    description:
      'Train an AI chatbot directly from a website URL. ChatbotsHub crawls your pages, cleans the HTML, and indexes the content automatically — no manual uploads.',
    excerpt:
      'Paste a URL and let ChatbotsHub crawl, clean, and index your website into a chatbot — no copy-paste, no uploads.',
    category: 'Features',
    keywords: [
      'ai chatbot trained on website url',
      'train chatbot from website',
      'train AI chatbot on URL',
      'website chatbot',
      'crawl website chatbot',
      'AI chatbot platform',
    ],
    author: AUTHOR,
    publishedAt: '2026-05-12',
    updatedAt: '2026-07-11',
    readingMinutes: 7,
    coverAlt: 'A website being crawled and turned into an AI chatbot knowledge base',
    content: [
      {
        type: 'p',
        text: 'Uploading documents is great, but your most up-to-date knowledge usually already lives on your website. With **website URL training**, you can point ChatbotsHub at your site and it will crawl the pages, clean the content, and turn it into a trained chatbot — without copying and pasting a single paragraph.',
      },
      {
        type: 'p',
        text: 'This feature sits right alongside [document training](/blog/how-to-train-a-chatbot-on-your-documents): you can mix uploaded files and crawled websites in the same knowledge base.',
      },
      { type: 'h2', text: 'What website URL training does' },
      {
        type: 'p',
        text: 'You enter a single URL — for example your homepage, help center, or docs site. ChatbotsHub then visits the public pages on that domain, extracts the meaningful text, and indexes it using the same retrieval pipeline that powers document training. The result is a chatbot that can answer questions using everything published on your site.',
      },
      { type: 'h2', text: 'How the crawler works, step by step' },
      {
        type: 'ol',
        items: [
          'You submit a website URL from the Knowledge Sources tab in your dashboard.',
          'The URL is validated and checked for safety before any request is made.',
          'The crawler fetches the page HTML and discovers links on the same domain.',
          'Navigation, scripts, styles, cookie banners, and footers are stripped out.',
          'The remaining clean text is chunked, embedded, and stored for retrieval.',
          'Your chatbot is ready to answer from the crawled content.',
        ],
      },
      {
        type: 'p',
        text: 'Under the hood this is the same [retrieval-augmented generation](/blog/what-is-rag-retrieval-augmented-generation) flow used for files, so answers stay grounded in your real content.',
      },
      { type: 'h2', text: 'Built-in safety' },
      {
        type: 'p',
        text: 'Crawling the open web has to be done responsibly. ChatbotsHub validates every URL and blocks requests to localhost, internal IP addresses, and private networks to prevent server-side request forgery (SSRF). Crawling endpoints are also rate-limited so the feature stays safe and predictable.',
      },
      { type: 'h2', text: 'Crawl limits by plan' },
      {
        type: 'ul',
        items: [
          '**Free:** up to 10 pages per website.',
          '**Starter:** up to 100 pages per website.',
          '**Pro:** up to 1,000 pages per website.',
        ],
      },
      {
        type: 'p',
        text: 'Each crawled website counts as one knowledge source, just like an uploaded document. Not sure which plan fits? Read our [AI chatbot pricing guide](/blog/ai-chatbot-pricing-guide).',
      },
      { type: 'h2', text: 'Best practices for clean results' },
      {
        type: 'ul',
        items: [
          'Point the crawler at content-rich sections like your docs or help center.',
          'Keep your pages updated — re-crawl after major content changes.',
          'Remove or de-index thin pages that add noise instead of answers.',
          'Combine a website crawl with focused FAQ documents for the best coverage.',
        ],
      },
      {
        type: 'quote',
        text: 'Your website is already your best knowledge base — website training just makes it answer questions.',
      },
      { type: 'h2', text: 'Website training vs document upload' },
      {
        type: 'p',
        text: 'Use website training when your knowledge already lives online and changes often. Use [document upload](/blog/how-to-train-a-chatbot-on-your-documents) for PDFs, contracts, and internal files that aren’t published on the web. Most teams use both together.',
      },
      { type: 'h2', text: 'FAQ: getting an AI chatbot trained on a website URL' },
      { type: 'h3', text: 'Can I get an AI chatbot trained on a website URL?' },
      {
        type: 'p',
        text: 'Yes. ChatbotsHub lets you get an AI chatbot trained on a website URL in minutes: paste your domain into the Knowledge Sources tab, and the crawler reads, cleans, and indexes your public pages automatically. There is no copy-pasting and no manual export.',
      },
      { type: 'h3', text: 'How long does it take to train a chatbot from a URL?' },
      {
        type: 'p',
        text: 'Most sites finish crawling and indexing within a few minutes. Larger sites take longer because more pages are fetched and embedded, but training runs in the background so you can keep working. See our related guide on [AI chatbot pricing](/blog/ai-chatbot-pricing-guide) for per-plan crawl limits.',
      },
      { type: 'h3', text: 'Does the chatbot stay in sync when my website changes?' },
      {
        type: 'p',
        text: 'Re-crawl your website URL after major content updates and the chatbot re-indexes the new pages. Keeping your source pages current is the easiest way to keep answers accurate.',
      },
      {
        type: 'cta',
        label: 'Train a chatbot from your website',
        href: '/auth/register',
        text: 'Paste a URL and watch it learn.',
      },
    ],
  },
  {
    slug: 'ai-chatbot-lead-capture',
    coverImage:
      'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80',
    title: 'AI Chatbot Lead Capture: Turn Conversations into Customers',
    description:
      'Capture leads automatically with an AI chatbot. Detect buying intent, show a smart lead form, notify your team instantly, and export leads to CSV.',
    excerpt:
      'Your chatbot already talks to buyers — lead capture turns those conversations into qualified leads automatically.',
    category: 'Features',
    keywords: [
      'chatbot lead capture',
      'lead generation chatbot',
      'AI lead qualification',
      'business chatbot',
    ],
    author: AUTHOR,
    publishedAt: '2026-05-26',
    updatedAt: '2026-05-26',
    readingMinutes: 7,
    coverAlt: 'An AI chatbot converting a conversation into a captured business lead',
    content: [
      {
        type: 'p',
        text: 'Every conversation with a potential customer is an opportunity — and most of them slip away. The **lead capture system** in ChatbotsHub turns chatbot conversations into qualified business leads automatically, so you never miss a buyer who was ready to talk.',
      },
      {
        type: 'p',
        text: 'It’s one of the most direct ways a [business chatbot grows revenue](/blog/business-chatbot-benefits): instead of just answering questions, your bot captures contact details at exactly the right moment.',
      },
      { type: 'h2', text: 'AI intent detection decides when to ask' },
      {
        type: 'p',
        text: 'Nobody likes a form that pops up too early. ChatbotsHub uses AI intent classification to read each message and detect buying signals before showing a lead form. For example:',
      },
      {
        type: 'ul',
        items: [
          '“How much will this cost me?” is detected as **pricing** intent.',
          '“Can someone from your team call me?” is detected as **contact** intent.',
        ],
      },
      {
        type: 'p',
        text: 'When the bot recognizes pricing or contact intent, it shows a lead form right inside the chat — without interrupting the conversation.',
      },
      { type: 'h2', text: 'What the lead form captures' },
      {
        type: 'ul',
        items: [
          'Name and email (required) to identify and reach the lead.',
          'Phone, company, and a short message (optional) for richer context.',
          'The originating chatbot and detected intent, captured automatically.',
        ],
      },
      {
        type: 'p',
        text: 'The form appears once per visitor session, so returning visitors aren’t asked again after they’ve shared their details. After submission, the conversation simply continues.',
      },
      { type: 'h2', text: 'Instant notifications and a clean pipeline' },
      {
        type: 'ol',
        items: [
          'Every new lead is saved to your dashboard the moment it’s submitted.',
          'Your admin gets an email notification so you can follow up fast.',
          'Leads move through statuses: New, Contacted, Qualified, and Closed.',
          'Export everything to CSV for your CRM or outreach tools.',
        ],
      },
      {
        type: 'quote',
        text: 'Speed wins deals. Capturing a lead the instant intent appears beats following up a day later.',
      },
      { type: 'h2', text: 'Tips to capture more (and better) leads' },
      {
        type: 'ul',
        items: [
          'Train your chatbot well so it earns trust before asking for details — start with [training on your documents](/blog/how-to-train-a-chatbot-on-your-documents).',
          'Keep pricing and contact information available so intent triggers fire naturally.',
          'Review captured leads regularly and update statuses to keep your pipeline clean.',
          'Pair lead capture with [analytics](/blog/chatbot-analytics-dashboard) to measure conversion rate over time.',
        ],
      },
      {
        type: 'cta',
        label: 'Start capturing leads',
        href: '/auth/register',
        text: 'Turn chatbot conversations into pipeline.',
      },
    ],
  },
  {
    slug: 'chatbot-analytics-dashboard',
    coverImage:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    title: 'Chatbot Analytics Dashboard: Track Engagement & Conversions',
    description:
      'A chatbot analytics dashboard that tracks conversations, engagement, answered vs unanswered queries, top questions, and lead conversion — all in one place.',
    excerpt:
      'You can’t improve what you don’t measure. The chatbot analytics dashboard shows exactly how your chatbot performs.',
    category: 'Features',
    keywords: [
      'chatbot analytics dashboard',
      'chatbot analytics',
      'chatbot dashboard',
      'conversation analytics',
      'chatbot reporting',
      'AI chatbot platform',
    ],
    author: AUTHOR,
    publishedAt: '2026-06-09',
    updatedAt: '2026-07-11',
    readingMinutes: 8,
    coverAlt: 'An analytics dashboard showing chatbot conversations and conversion charts',
    content: [
      {
        type: 'p',
        text: 'A chatbot that you can’t measure is a black box. The **chatbot analytics dashboard** in ChatbotsHub gives you clear visibility into how visitors use your chatbot, how well it answers, and how many conversations turn into leads — all in one place.',
      },
      { type: 'h2', text: 'What is a chatbot analytics dashboard?' },
      {
        type: 'p',
        text: 'A chatbot analytics dashboard is a single view that reports how your AI chatbot performs: conversation volume, engagement depth, answered vs unanswered questions, top queries, and lead conversion. Instead of guessing, you get the numbers you need to improve answers and prove ROI.',
      },
      { type: 'h2', text: 'Overview: the metrics that matter' },
      {
        type: 'ul',
        items: [
          '**Total conversations** — how many chat sessions your bot handled.',
          '**Unique visitors** — how many distinct people engaged.',
          '**Total messages** — overall conversation volume.',
          '**Leads generated** — conversations converted via [lead capture](/blog/ai-chatbot-lead-capture).',
        ],
      },
      { type: 'h2', text: 'Engagement: how deep conversations go' },
      {
        type: 'ul',
        items: [
          '**Average messages per session** shows how engaging your bot is.',
          '**Average session duration** reveals how long visitors stay.',
          '**Bounce rate** tracks single-message sessions that didn’t go further.',
        ],
      },
      { type: 'h2', text: 'Knowledge quality: is your bot actually answering?' },
      {
        type: 'p',
        text: 'This is where analytics becomes actionable. ChatbotsHub tracks **answered vs unanswered queries** and an average **confidence score** for retrieved answers. A rising unanswered count is a direct signal that you have knowledge gaps to fill.',
      },
      {
        type: 'p',
        text: 'When you spot gaps, close them by adding content — either by [training on documents](/blog/how-to-train-a-chatbot-on-your-documents) or [crawling a website URL](/blog/train-chatbot-from-website-url).',
      },
      { type: 'h2', text: 'Top questions and trends' },
      {
        type: 'p',
        text: 'See the most-asked questions ranked by frequency, plus trends over time for conversations, leads, and engagement. These insights tell you what your audience cares about most — perfect for prioritizing new content and FAQs.',
      },
      { type: 'h2', text: 'Flexible date filters' },
      {
        type: 'ol',
        items: [
          'Today — a quick pulse on current activity.',
          '7 days — short-term trends and recent changes.',
          '30 and 90 days — longer-term performance.',
          'Custom range — zoom in on a campaign or launch window.',
        ],
      },
      {
        type: 'quote',
        text: 'The unanswered-questions chart is the single most valuable view — it tells you exactly what to add next.',
      },
      { type: 'h2', text: 'Turn insight into action' },
      {
        type: 'p',
        text: 'Use analytics as a weekly habit: check unanswered queries, add missing knowledge, watch your answer rate climb, and track how conversions improve. Combined with [lead capture](/blog/ai-chatbot-lead-capture), you get a complete picture from first message to closed lead.',
      },
      { type: 'h2', text: 'Chatbot analytics dashboard FAQ' },
      { type: 'h3', text: 'What metrics should a chatbot analytics dashboard track?' },
      {
        type: 'p',
        text: 'At minimum, a chatbot analytics dashboard should track total conversations, unique visitors, messages per session, answered vs unanswered queries, top questions, and leads generated. Together these show reach, engagement, answer quality, and business impact.',
      },
      { type: 'h3', text: 'How do I use a chatbot analytics dashboard to improve answers?' },
      {
        type: 'p',
        text: 'Watch the unanswered-questions view. Each unanswered query is a knowledge gap — close it by [training on documents](/blog/how-to-train-a-chatbot-on-your-documents) or [crawling a website URL](/blog/train-chatbot-from-website-url), then confirm your answer rate rises in the dashboard.',
      },
      {
        type: 'cta',
        label: 'See your chatbot analytics',
        href: '/auth/register',
        text: 'Measure, improve, and convert more.',
      },
    ],
  },
  {
    slug: 'what-is-an-ai-chatbot-hub',
    coverImage:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    title: 'What Is an AI Chatbot Hub? A Complete Guide',
    description:
      'An AI Chatbot Hub is one platform to build, train, deploy, and measure AI chatbots. Learn what an AI chatbot hub does and how to launch your first bot in minutes.',
    excerpt:
      'An AI Chatbot Hub brings building, training, embedding, and analytics into one place. Here’s what that means and why it matters.',
    category: 'Guides',
    keywords: [
      'AI Chatbot Hub',
      'ai chatbot hub',
      'chatbot hub',
      'AI chatbot platform',
      'AI chatbot builder',
      'ChatbotsHub',
    ],
    author: AUTHOR,
    publishedAt: '2026-07-11',
    updatedAt: '2026-07-11',
    readingMinutes: 7,
    coverAlt: 'A central AI chatbot hub connecting knowledge sources, channels, and analytics',
    content: [
      {
        type: 'p',
        text: 'An **AI Chatbot Hub** is a single platform where you build, train, deploy, and measure AI chatbots — instead of stitching together separate tools for content ingestion, retrieval, hosting, and analytics. If you have ever juggled one service for embeddings, another for hosting, and a third for reporting, a hub is the alternative: everything your chatbot needs, in one place.',
      },
      {
        type: 'p',
        text: 'That is exactly what [ChatbotsHub — the AI Chatbot Hub](/) is built to be. This guide explains what an AI chatbot hub actually does, who it is for, and how to launch your first bot without gluing five products together.',
      },
      { type: 'h2', text: 'What does an AI Chatbot Hub do?' },
      {
        type: 'p',
        text: 'A true AI chatbot hub covers the full lifecycle of a chatbot. Rather than being a single narrow feature, it connects the pieces that a production chatbot depends on:',
      },
      {
        type: 'ul',
        items: [
          '**Ingest knowledge** — upload documents or [train from a website URL](/blog/train-chatbot-from-website-url) so the bot answers from your real content.',
          '**Train and index** — chunking, embeddings, and vector search are handled for you, no ML plumbing required.',
          '**Deploy anywhere** — get an embeddable script, an API key, and a shareable testing link for the same bot.',
          '**Measure and improve** — a built-in [chatbot analytics dashboard](/blog/chatbot-analytics-dashboard) shows what works and where the knowledge gaps are.',
        ],
      },
      { type: 'h2', text: 'Why use an AI Chatbot Hub instead of separate tools?' },
      {
        type: 'p',
        text: 'Separate tools mean separate bills, separate dashboards, and brittle integrations that break when one vendor changes an API. An AI chatbot hub removes that overhead so you can focus on the answers your customers need — not the pipeline behind them.',
      },
      {
        type: 'ul',
        items: [
          '**One workflow** from raw content to a live, embeddable chatbot.',
          '**Consistent retrieval** so answers stay accurate across every channel.',
          '**Shared analytics** that tie conversations back to knowledge quality and conversions.',
          '**Predictable pricing** — see the [AI chatbot pricing guide](/blog/ai-chatbot-pricing-guide) for how plans scale.',
        ],
      },
      {
        type: 'quote',
        text: 'A hub isn’t one more tool — it’s the tool that replaces the five you were about to buy.',
      },
      { type: 'h2', text: 'Who is an AI Chatbot Hub for?' },
      {
        type: 'p',
        text: 'Support teams use a hub to deflect repetitive tickets, marketing teams use it to capture and qualify leads, and product teams use it to answer documentation questions instantly. Because everything lives in one place, a small team can run a serious chatbot without a dedicated ML engineer.',
      },
      { type: 'h2', text: 'How to launch your first bot on the hub' },
      {
        type: 'ol',
        items: [
          'Create a free account and open a new chatbot workspace.',
          'Add knowledge — upload documents or paste a website URL to crawl.',
          'Let the hub chunk, embed, and index your content automatically.',
          'Test answers with the shareable link, then embed the script or call the API.',
          'Open the analytics dashboard weekly to close knowledge gaps and lift your answer rate.',
        ],
      },
      { type: 'h2', text: 'AI Chatbot Hub FAQ' },
      { type: 'h3', text: 'What is an AI Chatbot Hub?' },
      {
        type: 'p',
        text: 'An AI Chatbot Hub is a single platform that combines chatbot building, knowledge training, deployment, and analytics — so you don’t need separate tools for each stage. [ChatbotsHub](/) is an AI Chatbot Hub you can start using for free.',
      },
      { type: 'h3', text: 'Is an AI Chatbot Hub different from a chatbot builder?' },
      {
        type: 'p',
        text: 'A chatbot builder usually stops at creating the bot. An AI chatbot hub goes further: it also handles training on your data, multi-channel deployment, and ongoing measurement through analytics.',
      },
      { type: 'h3', text: 'Do I need coding skills to use an AI Chatbot Hub?' },
      {
        type: 'p',
        text: 'No. You add knowledge, test, and copy an embed script or API key. The retrieval, embeddings, and hosting are managed for you.',
      },
      {
        type: 'cta',
        label: 'Start on the AI Chatbot Hub free',
        href: '/auth/register',
        text: 'Build, train, and deploy your chatbot in one place.',
      },
    ],
  },
];

export function getAllPosts(): BlogPost[] {
  return [...BLOG_POSTS].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}

export function getRelatedPosts(slug: string, limit = 3): BlogPost[] {
  const current = getPostBySlug(slug);
  if (!current) return getAllPosts().slice(0, limit);

  const scored = BLOG_POSTS.filter((post) => post.slug !== slug).map((post) => {
    const shared = post.keywords.filter((k) => current.keywords.includes(k)).length;
    const sameCategory = post.category === current.category ? 1 : 0;
    return { post, score: shared * 2 + sameCategory };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.post);
}

export function getPostUrl(slug: string): string {
  return `${siteConfig.url}/blog/${slug}`;
}

export function getPostCoverPath(slug: string): string {
  // Per-post dynamic OG cover (also used as the article hero image)
  return `/blog/${slug}/opengraph-image`;
}
