import { siteConfig } from '@/lib/seo';

/**
 * Programmatic SEO data for /chatbot-for/[slug] landing pages.
 *
 * Two families are generated from the same template:
 *  - `integration` — "AI chatbot for WordPress/Shopify/..." (embed-fit long-tail)
 *  - `industry`    — "AI chatbot for real estate/ecommerce/..." (use-case long-tail)
 *
 * Every entry carries UNIQUE copy (intro, benefits, steps, use cases, FAQs) so
 * the pages are genuinely distinct content rather than thin duplicates.
 */

export type SolutionType = 'integration' | 'industry';

export interface SolutionFaq {
  question: string;
  answer: string;
}

export interface SolutionBenefit {
  title: string;
  description: string;
}

export interface Solution {
  slug: string;
  type: SolutionType;
  /** Display name, e.g. "WordPress" or "Real Estate". */
  name: string;
  /** Meta title WITHOUT the brand suffix (root template appends " | ChatbotsHub"). */
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  heroTagline: string;
  heroSubtitle: string;
  intro: string[];
  benefits: SolutionBenefit[];
  /** Ordered "how to get started / add it" steps. */
  steps: string[];
  useCases: string[];
  faqs: SolutionFaq[];
  relatedSlugs?: string[];
}

export const SOLUTIONS: Solution[] = [
  // ── Integrations ────────────────────────────────────────────────
  {
    slug: 'wordpress',
    type: 'integration',
    name: 'WordPress',
    metaTitle: 'AI Chatbot for WordPress',
    metaDescription:
      'Add an AI chatbot to your WordPress site in minutes. Train it on your pages, docs, and FAQs, then embed it with one script — no plugin bloat or code required.',
    keywords: [
      'AI chatbot for WordPress',
      'WordPress chatbot',
      'add chatbot to WordPress',
      'WordPress AI chatbot plugin alternative',
    ],
    heroTagline: 'WordPress Integration',
    heroSubtitle:
      'Turn your WordPress site into a 24/7 support and lead-generation machine. Train a chatbot on your own content and embed it with a single script tag.',
    intro: [
      'WordPress powers a huge share of the web, but its built-in tools stop at contact forms and static FAQ pages. Visitors with a real question still have to email you and wait. An AI chatbot closes that gap by answering instantly, in your brand voice, using the content you already publish.',
      'With ChatbotsHub you do not need a heavy plugin or a developer. You train a chatbot on your posts, product pages, and documents, then paste one lightweight script into your theme. It works on any WordPress setup — self-hosted, managed, or WooCommerce.',
    ],
    benefits: [
      {
        title: 'No plugin bloat',
        description:
          'A single async script instead of another database-heavy plugin that slows your site down and needs constant updates.',
      },
      {
        title: 'Trained on your real content',
        description:
          'Upload PDFs and docs or crawl your existing pages so answers come from your knowledge — not generic guesses.',
      },
      {
        title: 'Capture leads while you sleep',
        description:
          'The widget answers questions and collects visitor details around the clock, so no enquiry goes cold overnight.',
      },
      {
        title: 'Matches your brand',
        description:
          'Custom name, colors, and avatar make the chatbot feel native to your WordPress theme.',
      },
    ],
    steps: [
      'Sign up free and create your chatbot in the ChatbotsHub dashboard.',
      'Upload documents or crawl your site so the bot learns your content.',
      'Copy your unique embed script from the dashboard.',
      'Paste the script before the closing </body> tag using your theme footer settings or a "headers and footers" helper plugin.',
      'Publish — the chatbot is live on every page instantly.',
    ],
    useCases: [
      'Deflect repetitive support questions from your blog and docs.',
      'Answer pre-sales questions on WooCommerce product pages.',
      'Qualify and capture leads from landing pages.',
      'Help visitors find the right article without searching.',
    ],
    faqs: [
      {
        question: 'Do I need a plugin to add the chatbot to WordPress?',
        answer:
          'No. ChatbotsHub gives you a single embed script. You can paste it into your theme footer or use any lightweight headers-and-footers helper — no dedicated plugin required.',
      },
      {
        question: 'Will the chatbot slow down my WordPress site?',
        answer:
          'No. The widget loads asynchronously after your page renders, so it has virtually no impact on load time or Core Web Vitals.',
      },
      {
        question: 'Does it work with WooCommerce?',
        answer:
          'Yes. You can train the chatbot on your product pages and policies so it answers shipping, returns, and pre-sales questions on any WooCommerce store.',
      },
      {
        question: 'Can I train it on my existing WordPress pages?',
        answer:
          'Yes. Crawl your site by URL or upload documents, and ChatbotsHub indexes the content so the chatbot answers from your own material.',
      },
    ],
    relatedSlugs: ['shopify', 'webflow', 'ecommerce'],
  },
  {
    slug: 'shopify',
    type: 'integration',
    name: 'Shopify',
    metaTitle: 'AI Chatbot for Shopify',
    metaDescription:
      'Add an AI chatbot to your Shopify store to answer product, shipping, and returns questions 24/7. Train it on your catalog and policies and embed it in minutes.',
    keywords: [
      'AI chatbot for Shopify',
      'Shopify chatbot',
      'Shopify AI assistant',
      'add chatbot to Shopify store',
    ],
    heroTagline: 'Shopify Integration',
    heroSubtitle:
      'Recover carts and answer buyer questions instantly. Train a chatbot on your catalog, shipping, and returns policies and add it to your Shopify theme.',
    intro: [
      'Most Shopify sales are lost to unanswered questions: Will it fit? When will it arrive? What is your return policy? An AI chatbot answers these the moment a shopper asks, right on the product page, which keeps them in the buying flow instead of bouncing.',
      'ChatbotsHub trains on your catalog, FAQs, and policy pages, then embeds into your Shopify theme with one script. No app subscription stack, no theme surgery — just faster answers and fewer abandoned carts.',
    ],
    benefits: [
      {
        title: 'Answer buyer questions on the spot',
        description:
          'Sizing, shipping, materials, and returns answered instantly so shoppers do not leave to "check later".',
      },
      {
        title: 'Reduce support tickets',
        description:
          'Deflect the repetitive "where is my order" and policy questions that flood your inbox during sales.',
      },
      {
        title: 'Trained on your store',
        description:
          'Upload policies and crawl product pages so answers reflect your real catalog and terms.',
      },
      {
        title: 'Lightweight and fast',
        description:
          'A single async script that will not bloat your theme or hurt store speed.',
      },
    ],
    steps: [
      'Create a free ChatbotsHub account and set up your chatbot.',
      'Upload your policies and crawl your product pages to train it.',
      'Copy the embed script from your dashboard.',
      'In Shopify, open your theme editor and paste the script into theme.liquid before </body>.',
      'Save and preview — the assistant is live across your store.',
    ],
    useCases: [
      'Pre-sales product questions on high-intent product pages.',
      'Shipping, delivery-time, and returns answers during checkout hesitation.',
      'Post-purchase support and order-policy questions.',
      'Collect emails for back-in-stock and promotions.',
    ],
    faqs: [
      {
        question: 'How do I add the chatbot to my Shopify theme?',
        answer:
          'Copy your ChatbotsHub embed script and paste it into theme.liquid before the closing </body> tag in the Shopify theme editor. It then appears on every storefront page.',
      },
      {
        question: 'Can the chatbot answer shipping and returns questions?',
        answer:
          'Yes. Train it on your shipping and returns policy pages and it will answer those questions accurately and consistently, 24/7.',
      },
      {
        question: 'Will it work during high-traffic sales events?',
        answer:
          'Yes. The chatbot scales to handle concurrent shoppers, which is exactly when deflecting repetitive questions matters most.',
      },
      {
        question: 'Does it require a paid Shopify app?',
        answer:
          'No. It is a script-based embed, so there is no Shopify app subscription — you manage everything from the ChatbotsHub dashboard.',
      },
    ],
    relatedSlugs: ['wordpress', 'ecommerce', 'wix'],
  },
  {
    slug: 'webflow',
    type: 'integration',
    name: 'Webflow',
    metaTitle: 'AI Chatbot for Webflow',
    metaDescription:
      'Add an AI chatbot to your Webflow site using custom code. Train it on your content and embed it in the footer code — live in minutes with no backend.',
    keywords: [
      'AI chatbot for Webflow',
      'Webflow chatbot',
      'add chatbot to Webflow',
      'Webflow AI assistant',
    ],
    heroTagline: 'Webflow Integration',
    heroSubtitle:
      'Give your beautifully designed Webflow site a brain. Train a chatbot on your content and drop it in via Webflow custom code.',
    intro: [
      'Webflow is built for design-led teams, and a clunky third-party chat widget can ruin that polish. ChatbotsHub gives you a clean, brandable chatbot that matches your site and answers visitor questions from your own content.',
      'Because Webflow supports custom code, adding the chatbot takes one paste into your footer code — no export, no external hosting, and nothing to maintain.',
    ],
    benefits: [
      {
        title: 'Design-friendly',
        description:
          'Custom colors, name, and avatar keep the widget on-brand with your Webflow design.',
      },
      {
        title: 'One-paste install',
        description:
          'Add it through Webflow Custom Code — no code export or developer handoff needed.',
      },
      {
        title: 'Answers from your content',
        description:
          'Train on your pages and documents so the bot is accurate, not generic.',
      },
      {
        title: 'Zero maintenance',
        description:
          'No backend to run — updates to your knowledge base go live automatically.',
      },
    ],
    steps: [
      'Sign up for ChatbotsHub and build your chatbot.',
      'Upload documents or crawl your Webflow pages to train it.',
      'Copy your embed script from the dashboard.',
      'In Webflow, go to Project Settings → Custom Code and paste the script into the Footer Code field.',
      'Publish your site — the chatbot goes live everywhere.',
    ],
    useCases: [
      'Answer product and service questions on marketing sites.',
      'Guide visitors to the right page or resource.',
      'Capture leads from portfolio and agency sites.',
      'Provide instant answers on documentation pages.',
    ],
    faqs: [
      {
        question: 'Where do I paste the chatbot code in Webflow?',
        answer:
          'Open Project Settings → Custom Code and paste your ChatbotsHub script into the Footer Code field, then republish. It will load site-wide.',
      },
      {
        question: 'Do I need to export my Webflow site?',
        answer:
          'No. The chatbot works on hosted Webflow sites through Custom Code — no export or external hosting required.',
      },
      {
        question: 'Can I match the chatbot to my Webflow design?',
        answer:
          'Yes. Customize the name, colors, and avatar in the dashboard so the widget blends into your Webflow brand.',
      },
      {
        question: 'Will it affect my Webflow site performance?',
        answer:
          'No. The widget loads asynchronously, so it does not block rendering or hurt your page speed.',
      },
    ],
    relatedSlugs: ['wordpress', 'wix', 'nextjs'],
  },
  {
    slug: 'wix',
    type: 'integration',
    name: 'Wix',
    metaTitle: 'AI Chatbot for Wix',
    metaDescription:
      'Add an AI chatbot to your Wix website with custom code. Train it on your pages and documents and embed it in minutes — no coding skills needed.',
    keywords: [
      'AI chatbot for Wix',
      'Wix chatbot',
      'add chatbot to Wix',
      'Wix AI assistant',
    ],
    heroTagline: 'Wix Integration',
    heroSubtitle:
      'Add a smart assistant to your Wix site without touching a line of code. Train it on your content and embed it through Wix custom code.',
    intro: [
      'Wix makes it easy to launch a site, but answering visitor questions still falls on you. An AI chatbot handles that automatically, replying with information pulled straight from your own pages and documents.',
      'ChatbotsHub installs on Wix through the built-in custom code feature. Paste one snippet and your chatbot is live on every page — no apps to buy, no developer to hire.',
    ],
    benefits: [
      {
        title: 'No coding required',
        description:
          'Add it through Wix Custom Code by pasting a single snippet — no technical skills needed.',
      },
      {
        title: 'Always-on answers',
        description:
          'Visitors get instant responses even when you are offline or asleep.',
      },
      {
        title: 'Trained on your site',
        description:
          'Crawl your Wix pages or upload files so replies are accurate and specific.',
      },
      {
        title: 'Lead capture built in',
        description:
          'Turn conversations into contacts by collecting names and emails automatically.',
      },
    ],
    steps: [
      'Create your free ChatbotsHub chatbot.',
      'Upload documents or crawl your Wix pages to train it.',
      'Copy the embed script from your dashboard.',
      'In Wix, go to Settings → Custom Code, add a new snippet, and paste it into "Body - end".',
      'Apply it to all pages and publish — the chatbot is live.',
    ],
    useCases: [
      'Answer service and booking questions for small businesses.',
      'Guide visitors on restaurant, salon, or clinic sites.',
      'Capture enquiries from local landing pages.',
      'Reduce repetitive phone and email questions.',
    ],
    faqs: [
      {
        question: 'How do I add a chatbot to Wix without code?',
        answer:
          'Go to Settings → Custom Code in your Wix dashboard, add a new code snippet, paste the ChatbotsHub script into the "Body - end" position, apply it to all pages, and publish.',
      },
      {
        question: 'Does it work on the free Wix plan?',
        answer:
          'Custom code embedding requires a Wix plan that supports adding custom code. Once that is available, the ChatbotsHub script works normally.',
      },
      {
        question: 'Can I train it on my Wix content?',
        answer:
          'Yes. Crawl your published Wix pages or upload documents and the chatbot will answer from that content.',
      },
      {
        question: 'Is there an extra app fee?',
        answer:
          'No. ChatbotsHub is script-based, so there is no Wix app to purchase — you manage the chatbot from your ChatbotsHub dashboard.',
      },
    ],
    relatedSlugs: ['wordpress', 'shopify', 'webflow'],
  },
  {
    slug: 'nextjs',
    type: 'integration',
    name: 'Next.js',
    metaTitle: 'AI Chatbot for Next.js',
    metaDescription:
      'Add an AI chatbot to your Next.js app with the next/script component or the REST API. Train it on your docs and ship a RAG chatbot in minutes.',
    keywords: [
      'AI chatbot for Next.js',
      'Next.js chatbot',
      'add chatbot to Next.js',
      'Next.js AI assistant',
      'chatbot API',
    ],
    heroTagline: 'Next.js Integration',
    heroSubtitle:
      'Ship a production RAG chatbot in your Next.js app. Embed the widget with next/script or call the REST API directly for full control.',
    intro: [
      'Next.js developers want a chatbot that respects performance budgets and does not require standing up a whole RAG pipeline. ChatbotsHub handles embeddings, vector search, and generation for you, and exposes both a drop-in widget and a REST API.',
      'Add the widget with the next/script component for a zero-effort launch, or call the API from a server action or route handler to build a fully custom chat UI. Either way, you skip the infrastructure and keep the developer experience.',
    ],
    benefits: [
      {
        title: 'Drop-in or fully custom',
        description:
          'Use the widget via next/script, or the REST API to build your own chat interface with your components.',
      },
      {
        title: 'No RAG plumbing',
        description:
          'Embeddings, chunking, vector search, and the LLM call are handled — you just send a question.',
      },
      {
        title: 'Performance-first',
        description:
          'Load the widget with the afterInteractive strategy so it never blocks hydration or LCP.',
      },
      {
        title: 'Own your knowledge base',
        description:
          'Train on your docs and update content without redeploying your app.',
      },
    ],
    steps: [
      'Sign up and create your chatbot, then grab your API key.',
      'Upload documents or crawl your site to build the knowledge base.',
      'For the widget: add <Script src="…/widget.js" strategy="afterInteractive" /> to your root layout.',
      'For a custom UI: call the chat REST API from a route handler or server action with your API key.',
      'Deploy — the chatbot is live in your Next.js app.',
    ],
    useCases: [
      'Docs assistant for developer products.',
      'In-app support for SaaS dashboards.',
      'Custom chat UI powered by your own components.',
      'AI search over product documentation.',
    ],
    faqs: [
      {
        question: 'How do I add the chatbot to a Next.js app?',
        answer:
          'Use the next/script component in your root layout with the widget URL and the afterInteractive strategy, or call the ChatbotsHub REST API from a route handler for a custom chat UI.',
      },
      {
        question: 'Is there an API instead of the widget?',
        answer:
          'Yes. ChatbotsHub exposes a REST API with an API key so you can build a fully custom chat experience with your own React components.',
      },
      {
        question: 'Will the widget hurt my Core Web Vitals?',
        answer:
          'No. Loading it with the afterInteractive strategy defers it until after hydration, so it does not block LCP or interactivity.',
      },
      {
        question: 'Do I need to build my own RAG pipeline?',
        answer:
          'No. ChatbotsHub handles embeddings, vector search, and generation, so you only send the user question and render the answer.',
      },
    ],
    relatedSlugs: ['react', 'webflow', 'saas-support'],
  },
  {
    slug: 'react',
    type: 'integration',
    name: 'React',
    metaTitle: 'AI Chatbot for React',
    metaDescription:
      'Add an AI chatbot to your React app with a script embed or the REST API. Train it on your content and build a custom RAG chat UI in minutes.',
    keywords: [
      'AI chatbot for React',
      'React chatbot',
      'add chatbot to React app',
      'React AI assistant',
      'chatbot API',
    ],
    heroTagline: 'React Integration',
    heroSubtitle:
      'Embed a ready-made chat widget in your React app, or call the API to build a bespoke chat experience with your own components.',
    intro: [
      'React apps come in every shape — Vite, CRA, single-page dashboards — and you want a chatbot that fits without a backend rewrite. ChatbotsHub gives you a script-based widget for instant setup and a REST API for full custom control.',
      'Inject the widget script in your entry HTML or a top-level effect, or call the chat API from your data layer and render answers in your own UI. The retrieval and generation happen on ChatbotsHub, so you focus on the interface.',
    ],
    benefits: [
      {
        title: 'Widget or API',
        description:
          'Ship fast with the embed script, or go fully custom with the REST API and your own components.',
      },
      {
        title: 'Framework-agnostic',
        description:
          'Works with Vite, Create React App, and any React setup — no special adapter needed.',
      },
      {
        title: 'Managed retrieval',
        description:
          'Vector search and the LLM call are handled for you; just send the question.',
      },
      {
        title: 'Update without redeploys',
        description:
          'Change your knowledge base in the dashboard and answers update instantly.',
      },
    ],
    steps: [
      'Create your chatbot and copy your API key.',
      'Train it by uploading documents or crawling your site.',
      'For the widget: add the script tag to index.html or inject it in a top-level useEffect.',
      'For a custom UI: call the chat REST API from your data layer with the API key.',
      'Build and deploy — the chatbot is live in your React app.',
    ],
    useCases: [
      'In-app help for React dashboards and tools.',
      'Custom-designed chat experiences.',
      'Knowledge search inside single-page apps.',
      'Onboarding assistants for new users.',
    ],
    faqs: [
      {
        question: 'How do I add a chatbot to a React app?',
        answer:
          'Add the ChatbotsHub widget script to your index.html or inject it in a top-level useEffect, or call the REST API from your data layer to render answers in your own components.',
      },
      {
        question: 'Can I build a custom chat UI in React?',
        answer:
          'Yes. Use the REST API with your API key to send questions and render responses using your own React components and styling.',
      },
      {
        question: 'Does it work with Vite and Create React App?',
        answer:
          'Yes. The embed script and API are framework-agnostic and work with any React toolchain.',
      },
      {
        question: 'Where does the AI processing happen?',
        answer:
          'On ChatbotsHub. Embeddings, vector search, and generation run server-side, so your React app just sends the question and displays the answer.',
      },
    ],
    relatedSlugs: ['nextjs', 'wordpress', 'saas-support'],
  },

  // ── Industries ──────────────────────────────────────────────────
  {
    slug: 'real-estate',
    type: 'industry',
    name: 'Real Estate',
    metaTitle: 'AI Chatbot for Real Estate',
    metaDescription:
      'An AI chatbot for real estate answers listing, pricing, and viewing questions 24/7 and captures buyer and seller leads. Train it on your listings in minutes.',
    keywords: [
      'AI chatbot for real estate',
      'real estate chatbot',
      'real estate lead generation chatbot',
      'property chatbot',
    ],
    heroTagline: 'Real Estate',
    heroSubtitle:
      'Never miss a hot lead again. A chatbot trained on your listings answers property questions and captures buyer details around the clock.',
    intro: [
      'In real estate, speed wins the deal. Buyers browse listings at night and on weekends, and the agent who responds first usually wins the appointment. An AI chatbot answers property questions instantly and captures contact details while you are showing another home.',
      'ChatbotsHub trains on your listings, neighborhood guides, and FAQs so it can answer questions about price, size, availability, and viewings — then hands qualified leads to your team.',
    ],
    benefits: [
      {
        title: 'Instant lead capture',
        description:
          'Convert late-night browsers into booked viewings by responding the moment they ask.',
      },
      {
        title: 'Answer listing questions',
        description:
          'Price, square footage, amenities, and availability answered straight from your listing data.',
      },
      {
        title: 'Qualify buyers automatically',
        description:
          'Collect budget, timeline, and contact details so your agents focus on ready buyers.',
      },
      {
        title: 'Always available',
        description:
          'Serve enquiries 24/7 across time zones without hiring an overnight team.',
      },
    ],
    steps: [
      'Sign up free and create your real-estate chatbot.',
      'Upload listing sheets, brochures, and neighborhood guides, or crawl your site.',
      'ChatbotsHub trains the bot on your properties and policies.',
      'Embed the widget on your site or share the direct test link with clients.',
      'Capture and route qualified leads to your agents automatically.',
    ],
    useCases: [
      'Answer property and pricing questions on listing pages.',
      'Book viewings and capture buyer contact details.',
      'Explain the buying, selling, or rental process.',
      'Qualify leads before an agent follows up.',
    ],
    faqs: [
      {
        question: 'How does an AI chatbot help real estate agents?',
        answer:
          'It answers listing, pricing, and viewing questions instantly and captures buyer contact details 24/7, so you respond first and never lose a lead to slow follow-up.',
      },
      {
        question: 'Can the chatbot answer questions about specific listings?',
        answer:
          'Yes. Train it on your listing sheets and brochures and it will answer price, size, amenity, and availability questions from that data.',
      },
      {
        question: 'Does it capture leads for my agents?',
        answer:
          'Yes. The chatbot collects names, contact details, budget, and timeline, so your agents receive qualified leads ready for follow-up.',
      },
      {
        question: 'How fast can I set it up?',
        answer:
          'Upload your listings and documents, and you can have a trained chatbot embedded on your site in minutes.',
      },
    ],
    relatedSlugs: ['ecommerce', 'wordpress', 'education'],
  },
  {
    slug: 'ecommerce',
    type: 'industry',
    name: 'Ecommerce',
    metaTitle: 'AI Chatbot for Ecommerce',
    metaDescription:
      'An AI chatbot for ecommerce answers product, shipping, and returns questions, recovers carts, and captures leads 24/7. Train it on your catalog in minutes.',
    keywords: [
      'AI chatbot for ecommerce',
      'ecommerce chatbot',
      'online store chatbot',
      'ecommerce customer support chatbot',
    ],
    heroTagline: 'Ecommerce',
    heroSubtitle:
      'Answer buyer questions the instant they arise and recover carts you would have lost. Train a chatbot on your catalog and policies.',
    intro: [
      'Online shoppers abandon carts the moment a question goes unanswered. An AI chatbot keeps them in the buying flow by resolving sizing, shipping, and returns questions on the spot — no waiting for an email reply.',
      'ChatbotsHub trains on your product catalog, FAQs, and policies so it can guide shoppers, reduce support load, and capture emails for remarketing — on any storefront.',
    ],
    benefits: [
      {
        title: 'Recover more carts',
        description:
          'Resolve last-minute doubts about sizing, shipping, and returns before the shopper leaves.',
      },
      {
        title: 'Cut support volume',
        description:
          'Automatically handle the repetitive "where is my order" and policy questions.',
      },
      {
        title: 'Sell 24/7',
        description:
          'Guide buyers and answer product questions even outside business hours.',
      },
      {
        title: 'Grow your list',
        description:
          'Capture emails for back-in-stock alerts and promotions during conversations.',
      },
    ],
    steps: [
      'Create a free ChatbotsHub account and set up your store chatbot.',
      'Upload your policies and crawl your product pages to train it.',
      'ChatbotsHub indexes your catalog and terms.',
      'Embed the widget on your storefront with one script.',
      'Answer buyers and capture leads automatically, 24/7.',
    ],
    useCases: [
      'Pre-sales product questions on product pages.',
      'Shipping, delivery-time, and returns answers.',
      'Order-status and post-purchase support.',
      'Email capture for promotions and restocks.',
    ],
    faqs: [
      {
        question: 'How does an AI chatbot increase ecommerce sales?',
        answer:
          'It resolves the product, sizing, shipping, and returns questions that cause cart abandonment, keeping shoppers in the buying flow and recovering sales you would otherwise lose.',
      },
      {
        question: 'Can it answer shipping and returns questions?',
        answer:
          'Yes. Train it on your shipping and returns policies and it will answer those questions accurately and consistently around the clock.',
      },
      {
        question: 'Which platforms does it work with?',
        answer:
          'Any storefront that supports a script embed, including Shopify, WooCommerce on WordPress, Wix, and custom sites.',
      },
      {
        question: 'Does it capture leads?',
        answer:
          'Yes. The chatbot can collect emails and contact details during conversations for remarketing and back-in-stock alerts.',
      },
    ],
    relatedSlugs: ['shopify', 'wordpress', 'saas-support'],
  },
  {
    slug: 'saas-support',
    type: 'industry',
    name: 'SaaS Support',
    metaTitle: 'AI Chatbot for SaaS Support',
    metaDescription:
      'An AI chatbot for SaaS support deflects tickets by answering from your docs and help center 24/7. Train it on your knowledge base and embed it in minutes.',
    keywords: [
      'AI chatbot for SaaS support',
      'SaaS support chatbot',
      'customer support chatbot',
      'help center chatbot',
    ],
    heroTagline: 'SaaS Support',
    heroSubtitle:
      'Deflect repetitive tickets and give users instant answers from your docs. Train a chatbot on your help center and ship it in your app.',
    intro: [
      'Support teams drown in the same questions every day, most of which are already answered in the docs. An AI chatbot surfaces those answers instantly, deflecting tier-1 tickets and freeing your team for the hard problems.',
      'ChatbotsHub trains on your documentation, help center, and changelogs, then embeds in your app or marketing site. Users get accurate answers in seconds, and unresolved issues can still be handed to a human.',
    ],
    benefits: [
      {
        title: 'Deflect tier-1 tickets',
        description:
          'Answer the repetitive setup and how-to questions automatically, cutting ticket volume.',
      },
      {
        title: 'Grounded in your docs',
        description:
          'Retrieval-augmented answers come from your documentation, not made-up guesses.',
      },
      {
        title: 'Faster resolution',
        description:
          'Users get accurate answers in seconds instead of waiting for the queue.',
      },
      {
        title: 'Scales with usage',
        description:
          'Handle spikes in questions after launches without adding headcount.',
      },
    ],
    steps: [
      'Sign up and create your support chatbot.',
      'Upload docs or crawl your help center and changelog to train it.',
      'ChatbotsHub indexes your knowledge base with vector search.',
      'Embed the widget in your app or docs, or use the API for a custom UI.',
      'Deflect tickets and route hard cases to your team.',
    ],
    useCases: [
      'In-app support for onboarding and setup.',
      'Docs and help-center search that actually answers.',
      'Deflection of repetitive tier-1 tickets.',
      'Post-launch question spikes without extra staff.',
    ],
    faqs: [
      {
        question: 'How does an AI chatbot reduce support tickets?',
        answer:
          'It answers common how-to and setup questions directly from your documentation, deflecting tier-1 tickets so your team can focus on complex issues.',
      },
      {
        question: 'Will it make up answers?',
        answer:
          'ChatbotsHub uses retrieval-augmented generation, so answers are grounded in your indexed docs. It is built to stay within your knowledge base rather than hallucinate.',
      },
      {
        question: 'Can I embed it inside my app?',
        answer:
          'Yes. Use the widget script inside your app or docs, or call the REST API to build a custom in-app support experience.',
      },
      {
        question: 'What content should I train it on?',
        answer:
          'Your product docs, help-center articles, FAQs, and changelogs give the chatbot the context it needs to resolve most support questions.',
      },
    ],
    relatedSlugs: ['nextjs', 'react', 'ecommerce'],
  },
  {
    slug: 'healthcare',
    type: 'industry',
    name: 'Healthcare',
    metaTitle: 'AI Chatbot for Healthcare',
    metaDescription:
      'An AI chatbot for healthcare answers appointment, service, and policy questions 24/7 and captures patient enquiries. Train it on your clinic information in minutes.',
    keywords: [
      'AI chatbot for healthcare',
      'healthcare chatbot',
      'medical practice chatbot',
      'clinic chatbot',
    ],
    heroTagline: 'Healthcare',
    heroSubtitle:
      'Help patients get answers about services, hours, and appointments instantly. Train a chatbot on your clinic information and FAQs.',
    intro: [
      'Clinics and healthcare providers field the same administrative questions constantly: opening hours, services offered, insurance accepted, and how to book. An AI chatbot answers these instantly, reducing phone load and helping patients get what they need faster.',
      'ChatbotsHub trains on your service pages, FAQs, and policies so it can handle routine enquiries and capture patient contact details. It is designed for general information and administrative support, not medical diagnosis.',
    ],
    benefits: [
      {
        title: 'Reduce phone load',
        description:
          'Automate answers to hours, services, location, and insurance questions.',
      },
      {
        title: 'Help patients book',
        description:
          'Guide patients to the right service and capture their details for appointment requests.',
      },
      {
        title: 'Answers from your info',
        description:
          'Trained on your clinic pages and FAQs so information stays accurate and on-brand.',
      },
      {
        title: 'Available after hours',
        description:
          'Patients get answers evenings and weekends when your front desk is closed.',
      },
    ],
    steps: [
      'Create a free ChatbotsHub account for your practice.',
      'Upload your service information, FAQs, and policies, or crawl your site.',
      'ChatbotsHub trains the chatbot on your clinic details.',
      'Embed the widget on your website or share the test link.',
      'Answer patient enquiries and capture requests 24/7.',
    ],
    useCases: [
      'Answer hours, location, and services questions.',
      'Explain insurance and payment policies.',
      'Guide patients to book the right appointment.',
      'Capture enquiries outside office hours.',
    ],
    faqs: [
      {
        question: 'What can a healthcare chatbot help with?',
        answer:
          'It handles administrative and informational questions — opening hours, services, insurance, location, and how to book — and captures patient enquiries around the clock.',
      },
      {
        question: 'Can it give medical advice or diagnoses?',
        answer:
          'No. ChatbotsHub is designed for general information and administrative support. It should not be used for medical diagnosis or treatment advice.',
      },
      {
        question: 'What information should I train it on?',
        answer:
          'Your service pages, FAQs, hours, location, and payment or insurance policies give the chatbot what it needs to answer routine patient questions.',
      },
      {
        question: 'Does it work after hours?',
        answer:
          'Yes. The chatbot answers 24/7, so patients get information in the evenings and on weekends when your front desk is closed.',
      },
    ],
    relatedSlugs: ['education', 'real-estate', 'wordpress'],
  },
  {
    slug: 'education',
    type: 'industry',
    name: 'Education',
    metaTitle: 'AI Chatbot for Education',
    metaDescription:
      'An AI chatbot for education answers student and applicant questions about courses, admissions, and deadlines 24/7. Train it on your program info in minutes.',
    keywords: [
      'AI chatbot for education',
      'education chatbot',
      'school chatbot',
      'university admissions chatbot',
    ],
    heroTagline: 'Education',
    heroSubtitle:
      'Answer student and applicant questions instantly. Train a chatbot on your courses, admissions, and campus information.',
    intro: [
      'Schools, universities, and course creators get flooded with the same questions every admissions season: entry requirements, deadlines, fees, and course details. An AI chatbot answers these instantly, freeing staff and giving prospective students a faster experience.',
      'ChatbotsHub trains on your prospectus, course pages, and FAQs so it can guide applicants and current students to the right information, and capture enquiries for your admissions team.',
    ],
    benefits: [
      {
        title: 'Handle admissions questions',
        description:
          'Answer entry requirements, deadlines, fees, and course details automatically.',
      },
      {
        title: 'Support students 24/7',
        description:
          'Give current and prospective students instant answers any time of day.',
      },
      {
        title: 'Trained on your programs',
        description:
          'Upload your prospectus and course pages so answers are accurate and specific.',
      },
      {
        title: 'Capture applicant leads',
        description:
          'Collect enquiries and contact details for your admissions team to follow up.',
      },
    ],
    steps: [
      'Sign up free and create your education chatbot.',
      'Upload your prospectus, course pages, and FAQs, or crawl your site.',
      'ChatbotsHub trains the bot on your program information.',
      'Embed the widget on your website or share the test link.',
      'Answer student questions and capture applicant enquiries 24/7.',
    ],
    useCases: [
      'Answer admissions and enrollment questions.',
      'Explain course content, fees, and deadlines.',
      'Support current students with campus info.',
      'Capture applicant enquiries for follow-up.',
    ],
    faqs: [
      {
        question: 'How can schools and universities use an AI chatbot?',
        answer:
          'It answers admissions, course, fee, and deadline questions instantly and captures applicant enquiries 24/7, reducing load on admissions staff during busy seasons.',
      },
      {
        question: 'Can it answer questions about specific courses?',
        answer:
          'Yes. Train it on your prospectus and course pages and it will answer content, requirement, and fee questions from that material.',
      },
      {
        question: 'Does it help current students too?',
        answer:
          'Yes. Beyond admissions, it can answer campus, policy, and general information questions for enrolled students.',
      },
      {
        question: 'How long does setup take?',
        answer:
          'Upload your documents and you can have a trained chatbot embedded on your site in minutes.',
      },
    ],
    relatedSlugs: ['healthcare', 'real-estate', 'saas-support'],
  },
];

export function getAllSolutions(): Solution[] {
  return SOLUTIONS;
}

export function getSolutionsByType(type: SolutionType): Solution[] {
  return SOLUTIONS.filter((s) => s.type === type);
}

export function getSolutionBySlug(slug: string): Solution | undefined {
  return SOLUTIONS.find((s) => s.slug === slug);
}

export function getSolutionUrl(slug: string): string {
  return `${siteConfig.url}/chatbot-for/${slug}`;
}

/** H1 / display heading — consistent, keyword-forward across every page. */
export function getSolutionHeading(solution: Solution): string {
  return `AI Chatbot for ${solution.name}`;
}

export function getRelatedSolutions(slug: string, limit = 3): Solution[] {
  const current = getSolutionBySlug(slug);
  if (!current) return SOLUTIONS.slice(0, limit);

  const explicit = (current.relatedSlugs ?? [])
    .map((s) => getSolutionBySlug(s))
    .filter((s): s is Solution => Boolean(s));

  if (explicit.length >= limit) return explicit.slice(0, limit);

  // Backfill with same-type solutions, then anything else.
  const backfill = SOLUTIONS.filter(
    (s) => s.slug !== slug && !explicit.some((e) => e.slug === s.slug),
  ).sort((a, b) => (a.type === current.type ? -1 : 1) - (b.type === current.type ? -1 : 1));

  return [...explicit, ...backfill].slice(0, limit);
}
