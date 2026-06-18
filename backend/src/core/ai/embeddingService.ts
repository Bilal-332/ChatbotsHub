import axios from 'axios';
import { config } from '@shared/config';
import { logger } from '@shared/logger';
import { AppError } from '@shared/errors';

const HF_ROUTER_BASE = 'https://router.huggingface.co/hf-inference/models';
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

// Status codes that are transient and worth retrying
const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * BGE retrieval models (e.g. BAAI/bge-small-en-v1.5) are trained to prepend a
 * short instruction to the QUERY side only (passages stay unprefixed). Applying
 * it improves retrieval recall. It is a no-op for non-BGE models.
 */
const BGE_QUERY_INSTRUCTION = 'Represent this sentence for searching relevant passages: ';

function buildQueryInput(text: string): string {
  return /bge/i.test(config.huggingface.embeddingModel)
    ? `${BGE_QUERY_INSTRUCTION}${text}`
    : text;
}

/**
 * Generate a single embedding vector for a text (passage/document side) using
 * the HuggingFace Inference API. The configured model is expected to produce
 * 384-dimensional vectors (e.g. BAAI/bge-small-en-v1.5) to match the Qdrant
 * collection dimension.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const url = `${HF_ROUTER_BASE}/${config.huggingface.embeddingModel}/pipeline/feature-extraction`;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await axios.post<number[] | number[][]>(
        url,
        { inputs: text, options: { wait_for_model: true } },
        {
          headers: {
            Authorization: `Bearer ${config.huggingface.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        },
      );

      const data = response.data;

      // The API may return [[...]] or [...] depending on input format
      if (Array.isArray(data[0])) {
        return (data as number[][])[0];
      }
      return data as number[];
    } catch (error) {
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;

      if (status && RETRYABLE_STATUSES.has(status)) {
        // Transient error (model loading, rate limit, server error) - wait and retry
        logger.warn(
          `HuggingFace API transient error (HTTP ${status}), retrying (${attempt}/${MAX_RETRIES})...`,
        );
        await sleep(RETRY_DELAY_MS * attempt);
        continue;
      }
      if (attempt === MAX_RETRIES) {
        logger.error('Embedding generation failed:', error);
        throw new AppError('Embedding service unavailable', 503, 'EMBEDDING_FAILED');
      }
      await sleep(RETRY_DELAY_MS * attempt);
    }
  }

  throw new AppError('Embedding generation failed after retries', 503, 'EMBEDDING_FAILED');
}

/**
 * Generate an embedding for a search QUERY. Adds the BGE query instruction
 * (when applicable) so queries and passages are encoded asymmetrically.
 * Use this for retrieval; use generateEmbedding for indexing passages.
 */
export async function generateQueryEmbedding(text: string): Promise<number[]> {
  return generateEmbedding(buildQueryInput(text));
}

/**
 * Generate embeddings for multiple texts in batches to avoid timeouts.
 */
export async function generateEmbeddingsBatch(
  texts: string[],
  batchSize = 8,
): Promise<number[][]> {
  const embeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const batchEmbeddings = await Promise.all(batch.map(generateEmbedding));
    embeddings.push(...batchEmbeddings);

    // Small delay between batches to respect rate limits
    if (i + batchSize < texts.length) {
      await sleep(200);
    }
  }

  return embeddings;
}
