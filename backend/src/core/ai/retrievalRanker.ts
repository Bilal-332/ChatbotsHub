import type { ScoredChunk } from '@shared/types';

const STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'by',
  'for',
  'from',
  'has',
  'how',
  'in',
  'is',
  'it',
  'of',
  'on',
  'or',
  'that',
  'the',
  'to',
  'was',
  'what',
  'when',
  'where',
  'which',
  'who',
  'why',
  'with',
  'you',
  'your',
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

function lexicalOverlapScore(query: string, chunk: string): number {
  const queryTokens = new Set(tokenize(query));
  if (queryTokens.size === 0) return 0;

  const chunkTokens = new Set(tokenize(chunk));
  if (chunkTokens.size === 0) return 0;

  let overlap = 0;
  queryTokens.forEach((token) => {
    if (chunkTokens.has(token)) overlap += 1;
  });

  return overlap / queryTokens.size;
}

export function rerankChunks(question: string, chunks: ScoredChunk[], topN = 5): ScoredChunk[] {
  return [...chunks]
    .map((chunk) => {
      const lexical = lexicalOverlapScore(question, chunk.text);
      const semantic = Math.max(0, Math.min(1, chunk.score));
      const rerankScore = semantic * 0.65 + lexical * 0.35;
      return {
        ...chunk,
        rerankScore,
      };
    })
    .sort((a, b) => (b.rerankScore ?? 0) - (a.rerankScore ?? 0))
    .slice(0, topN);
}

export function calculateRetrievalConfidence(chunks: ScoredChunk[]): number {
  if (chunks.length === 0) return 0;

  const topChunks = chunks.slice(0, 3);
  const total = topChunks.reduce((sum, chunk) => sum + (chunk.rerankScore ?? 0), 0);
  return total / topChunks.length;
}
