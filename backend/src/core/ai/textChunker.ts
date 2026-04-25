/**
 * Splits text into overlapping chunks suitable for semantic search.
 * Uses word-boundary splitting to avoid cutting words mid-sentence.
 *
 * @param text - Raw text to chunk
 * @param chunkSize - Target chunk size in words (default: 150, ~700 tokens)
 * @param overlapSize - Overlap between consecutive chunks in words (default: 25, ~100 tokens)
 */
export function chunkText(
  text: string,
  chunkSize = 150,
  overlapSize = 25,
): string[] {
  // Normalize whitespace
  const normalized = text.replace(/\s+/g, ' ').trim();

  if (!normalized) return [];

  const words = normalized.split(' ');

  if (words.length <= chunkSize) {
    return [normalized];
  }

  const chunks: string[] = [];
  let start = 0;

  while (start < words.length) {
    const end = Math.min(start + chunkSize, words.length);
    const chunk = words.slice(start, end).join(' ');

    if (chunk.trim()) {
      chunks.push(chunk);
    }

    // Move forward by (chunkSize - overlapSize) to create overlapping windows
    start += chunkSize - overlapSize;

    // Prevent infinite loop on edge cases
    if (start >= words.length) break;
  }

  return chunks;
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
