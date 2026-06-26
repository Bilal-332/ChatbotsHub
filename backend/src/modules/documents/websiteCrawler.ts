import axios from 'axios';
import * as cheerio from 'cheerio';
import { AppError } from '@shared/errors';
import { logger } from '@shared/logger';
import { cleanText } from '@core/ai/textChunker';
import { assertSafePublicUrl } from './urlValidator';

const REQUEST_TIMEOUT_MS = 20_000;
const MAX_CONTENT_BYTES = 5 * 1024 * 1024; // 5 MB per page
const MAX_REDIRECT_HOPS = 3;
const USER_AGENT = 'ChatbotsHubBot/1.0 (+https://chatbotshub.me)';

// HTML elements that never contain meaningful answerable content.
const STRIP_SELECTORS = [
  'script',
  'style',
  'noscript',
  'svg',
  'iframe',
  'canvas',
  'video',
  'audio',
  'form',
  'nav',
  'header',
  'footer',
  'aside',
  '[role="navigation"]',
  '[role="banner"]',
  '[role="contentinfo"]',
  '[aria-hidden="true"]',
  '[hidden]',
  '[class*="cookie"]',
  '[id*="cookie"]',
  '[class*="consent"]',
  '[id*="consent"]',
  '[class*="newsletter"]',
  '[class*="breadcrumb"]',
];

export interface CrawledPage {
  url: string;
  text: string;
}

export interface CrawlResult {
  title: string;
  text: string;
  pagesCrawled: number;
  pageUrls: string[];
}

/**
 * Fetch a single URL's HTML, manually following (and re-validating) redirects so
 * a public page cannot redirect us into a private network (SSRF).
 */
async function fetchHtml(url: string, hop = 0): Promise<{ html: string; finalUrl: string } | null> {
  if (hop > MAX_REDIRECT_HOPS) {
    return null;
  }

  await assertSafePublicUrl(url);

  const response = await axios.get<string>(url, {
    timeout: REQUEST_TIMEOUT_MS,
    maxContentLength: MAX_CONTENT_BYTES,
    maxBodyLength: MAX_CONTENT_BYTES,
    maxRedirects: 0,
    responseType: 'text',
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'text/html,application/xhtml+xml',
    },
    // We handle 3xx ourselves; treat them as resolvable, everything else <400 is ok.
    validateStatus: (status) => status < 400,
  });

  if (response.status >= 300 && response.status < 400) {
    const location = response.headers['location'] as string | undefined;
    if (!location) return null;
    const nextUrl = new URL(location, url).toString();
    return fetchHtml(nextUrl, hop + 1);
  }

  const contentType = String(response.headers['content-type'] ?? '');
  if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
    return null;
  }

  return { html: response.data, finalUrl: url };
}

/**
 * Extract clean, human-readable text from a page's HTML and the in-document
 * links that belong to the same origin (used to expand the crawl frontier).
 */
function extractContentAndLinks(
  html: string,
  pageUrl: string,
  origin: string,
): { title: string; text: string; links: string[] } {
  const $ = cheerio.load(html);

  const title = ($('title').first().text() || $('h1').first().text() || '').trim();

  const links: string[] = [];
  $('a[href]').each((_i, el) => {
    const href = $(el).attr('href');
    if (!href) return;
    if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) {
      return;
    }
    try {
      const resolved = new URL(href, pageUrl);
      resolved.hash = '';
      if (resolved.origin === origin && (resolved.protocol === 'http:' || resolved.protocol === 'https:')) {
        links.push(resolved.toString());
      }
    } catch {
      // Ignore malformed hrefs.
    }
  });

  $(STRIP_SELECTORS.join(',')).remove();

  // Prefer the main content region when present, fall back to the body.
  const root = $('main').length ? $('main') : $('article').length ? $('article') : $('body');
  const rawText = root.text();

  return { title, text: cleanText(rawText), links };
}

/**
 * Remove navigation/footer/menu lines that repeat across many pages. A line
 * that shows up on more than 60% of crawled pages (when we have several pages)
 * is almost certainly boilerplate rather than real content.
 */
function removeRepeatedBoilerplate(pages: CrawledPage[]): CrawledPage[] {
  if (pages.length < 4) {
    return pages;
  }

  const lineFrequency = new Map<string, number>();
  for (const page of pages) {
    const uniqueLines = new Set(
      page.text
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0),
    );
    for (const line of uniqueLines) {
      lineFrequency.set(line, (lineFrequency.get(line) ?? 0) + 1);
    }
  }

  const threshold = Math.ceil(pages.length * 0.6);
  const boilerplate = new Set(
    [...lineFrequency.entries()]
      .filter(([line, count]) => count >= threshold && line.length < 200)
      .map(([line]) => line),
  );

  if (boilerplate.size === 0) {
    return pages;
  }

  return pages.map((page) => ({
    url: page.url,
    text: page.text
      .split('\n')
      .filter((line) => !boilerplate.has(line.trim()))
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim(),
  }));
}

/**
 * Breadth-first, same-origin crawl that returns cleaned, de-duplicated text
 * combined from every visited page, up to `maxPages`.
 */
export async function crawlWebsite(seedUrl: string, maxPages: number): Promise<CrawlResult> {
  const validated = await assertSafePublicUrl(seedUrl);
  const origin = validated.origin;

  const visited = new Set<string>();
  const queue: string[] = [validated.url];
  const pages: CrawledPage[] = [];
  let siteTitle = '';

  while (queue.length > 0 && pages.length < maxPages) {
    const current = queue.shift();
    if (!current || visited.has(current)) {
      continue;
    }
    visited.add(current);

    try {
      const fetched = await fetchHtml(current);
      if (!fetched) {
        continue;
      }

      const { title, text, links } = extractContentAndLinks(fetched.html, current, origin);

      if (!siteTitle && title) {
        siteTitle = title;
      }

      if (text.length >= 50) {
        pages.push({ url: current, text });
      }

      for (const link of links) {
        if (!visited.has(link) && !queue.includes(link) && pages.length + queue.length < maxPages * 3) {
          queue.push(link);
        }
      }
    } catch (error) {
      logger.warn(`Crawl skipped ${current}: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  }

  if (pages.length === 0) {
    throw new AppError(
      'No readable content could be extracted from this website',
      422,
      'WEBSITE_NO_CONTENT',
    );
  }

  const cleanedPages = removeRepeatedBoilerplate(pages);

  const combinedText = cleanedPages
    .map((page) => page.text)
    .filter((text) => text.length > 0)
    .join('\n\n')
    .trim();

  if (combinedText.length < 50) {
    throw new AppError(
      'No readable content could be extracted from this website',
      422,
      'WEBSITE_NO_CONTENT',
    );
  }

  return {
    title: siteTitle || validated.hostname,
    text: combinedText,
    pagesCrawled: cleanedPages.length,
    pageUrls: cleanedPages.map((page) => page.url),
  };
}
