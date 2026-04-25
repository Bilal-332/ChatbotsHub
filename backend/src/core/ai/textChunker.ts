export interface ChunkedText {
  text: string;
  section?: string;
  pageNumber?: number;
}

interface ChunkingOptions {
  targetTokens: number;
  maxTokens: number;
  overlapTokens: number;
}

const DEFAULT_CHUNK_OPTIONS: ChunkingOptions = {
  targetTokens: 380,
  maxTokens: 500,
  overlapTokens: 70,
};

function estimateTokenCount(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words * 1.3));
}

function toOverlapTail(text: string, overlapTokens: number): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const overlapWords = Math.max(1, Math.floor(overlapTokens / 1.3));
  return words.slice(-overlapWords).join(' ');
}

function isLikelyHeading(paragraph: string): boolean {
  const trimmed = paragraph.trim();
  if (!trimmed) return false;
  if (trimmed.length > 100) return false;
  if (/[.!?]$/.test(trimmed)) return false;

  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length === 0 || words.length > 12) return false;

  // Lines with many title-cased or uppercase words are usually headings.
  const headingLikeCount = words.filter((word) => /^[A-Z0-9][A-Za-z0-9:/-]*$/.test(word)).length;
  return headingLikeCount >= Math.ceil(words.length * 0.5);
}

function splitLargeParagraph(paragraph: string, maxTokens: number, overlapTokens: number): string[] {
  const sentenceParts = paragraph
    .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (sentenceParts.length > 1) {
    const sentenceChunks: string[] = [];
    let sentenceBuffer: string[] = [];
    let sentenceBufferTokens = 0;

    for (const sentence of sentenceParts) {
      const sentenceTokens = estimateTokenCount(sentence);

      if (sentenceBufferTokens + sentenceTokens > maxTokens && sentenceBuffer.length > 0) {
        sentenceChunks.push(sentenceBuffer.join(' ').trim());

        const overlapText = toOverlapTail(sentenceBuffer.join(' '), overlapTokens);
        sentenceBuffer = overlapText ? [overlapText] : [];
        sentenceBufferTokens = overlapText ? estimateTokenCount(overlapText) : 0;
      }

      sentenceBuffer.push(sentence);
      sentenceBufferTokens += sentenceTokens;
    }

    if (sentenceBuffer.length > 0) {
      sentenceChunks.push(sentenceBuffer.join(' ').trim());
    }

    if (sentenceChunks.length > 0) {
      return sentenceChunks;
    }
  }

  const words = paragraph.trim().split(/\s+/).filter(Boolean);
  const windowWords = Math.max(40, Math.floor(maxTokens / 1.3));
  const overlapWords = Math.max(8, Math.floor(overlapTokens / 1.3));

  if (words.length <= windowWords) {
    return [paragraph.trim()];
  }

  const slices: string[] = [];
  let start = 0;

  while (start < words.length) {
    const end = Math.min(start + windowWords, words.length);
    const slice = words.slice(start, end).join(' ').trim();
    if (slice) {
      slices.push(slice);
    }
    if (end >= words.length) {
      break;
    }
    start += Math.max(1, windowWords - overlapWords);
  }

  return slices;
}

/**
 * Semantic chunking that prefers paragraph boundaries and keeps overlap.
 * Target size is 300-500 tokens per chunk for better retrieval quality.
 */
export function chunkTextWithMetadata(
  text: string,
  options: Partial<ChunkingOptions> = {},
): ChunkedText[] {
  const { targetTokens, maxTokens, overlapTokens } = {
    ...DEFAULT_CHUNK_OPTIONS,
    ...options,
  };

  const normalized = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  if (!normalized) return [];

  const paragraphs = normalized
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) return [];

  const chunks: ChunkedText[] = [];
  let currentSection: string | undefined;
  let bufferParts: string[] = [];
  let bufferTokens = 0;
  let bufferSection: string | undefined;

  const flushBuffer = (): void => {
    const textChunk = bufferParts.join('\n\n').trim();
    if (!textChunk) return;

    chunks.push({
      text: textChunk,
      section: bufferSection,
    });

    const overlapText = toOverlapTail(textChunk, overlapTokens);
    bufferParts = overlapText ? [overlapText] : [];
    bufferTokens = overlapText ? estimateTokenCount(overlapText) : 0;
    bufferSection = bufferSection ?? currentSection;
  };

  for (const paragraph of paragraphs) {
    if (isLikelyHeading(paragraph)) {
      currentSection = paragraph;
      continue;
    }

    const paraTokens = estimateTokenCount(paragraph);

    if (paraTokens > maxTokens) {
      if (bufferParts.length > 0) {
        flushBuffer();
      }

      const parts = splitLargeParagraph(paragraph, maxTokens, overlapTokens);
      for (const part of parts) {
        chunks.push({
          text: part,
          section: currentSection,
        });
      }

      continue;
    }

    if (bufferParts.length === 0) {
      bufferSection = currentSection;
    }

    if (bufferTokens + paraTokens > maxTokens && bufferParts.length > 0) {
      flushBuffer();
      bufferSection = currentSection;
    }

    bufferParts.push(paragraph);
    bufferTokens += paraTokens;

    if (bufferTokens >= targetTokens) {
      flushBuffer();
    }
  }

  if (bufferParts.length > 0) {
    const textChunk = bufferParts.join('\n\n').trim();
    if (textChunk) {
      chunks.push({
        text: textChunk,
        section: bufferSection,
      });
    }
  }

  return chunks;
}

/**
 * Backward-compatible helper that returns only chunk text.
 */
export function chunkText(text: string): string[] {
  return chunkTextWithMetadata(text).map((chunk) => chunk.text);
}

/**
 * Clean extracted text by removing excessive whitespace,
 * control characters, and page artifacts.
 */
export function cleanText(raw: string): string {
  return raw
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control chars (keep \n, \t)
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')         // Collapse horizontal whitespace
    .replace(/\n{3,}/g, '\n\n')      // Max 2 consecutive newlines
    .trim();
}
