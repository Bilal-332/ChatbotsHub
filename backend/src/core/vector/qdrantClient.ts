import { QdrantClient } from '@qdrant/js-client-rest';
import { config } from '@shared/config';
import { logger } from '@shared/logger';
import type { ChunkMetadata, ScoredChunk } from '@shared/types';

// Dimension for sentence-transformers/all-MiniLM-L6-v2
const VECTOR_SIZE = 384;
const COLLECTION_NAME = 'chatbotshub_embeddings';

let client: QdrantClient;

export function getQdrantClient(): QdrantClient {
  if (!client) {
    client = new QdrantClient({
      url: config.qdrant.url,
      ...(config.qdrant.apiKey ? { apiKey: config.qdrant.apiKey } : {}),
    });
  }
  return client;
}

export async function initializeVectorStore(): Promise<void> {
  const qdrant = getQdrantClient();

  try {
    const collections = await qdrant.getCollections();
    const exists = collections.collections.some((c) => c.name === COLLECTION_NAME);

    if (!exists) {
      await qdrant.createCollection(COLLECTION_NAME, {
        vectors: {
          size: VECTOR_SIZE,
          distance: 'Cosine',
        },
        optimizers_config: {
          default_segment_number: 2,
        },
        replication_factor: 1,
      });

      // Create payload index for fast filtering by organizationId
      await qdrant.createPayloadIndex(COLLECTION_NAME, {
        field_name: 'organizationId',
        field_schema: 'keyword',
        wait: true,
      });

      await qdrant.createPayloadIndex(COLLECTION_NAME, {
        field_name: 'documentId',
        field_schema: 'keyword',
        wait: true,
      });

      logger.info(`✅ Qdrant collection "${COLLECTION_NAME}" created`);
    } else {
      logger.info(`✅ Qdrant collection "${COLLECTION_NAME}" already exists`);
    }
  } catch (error) {
    logger.error('Failed to initialize Qdrant:', error);
    throw error;
  }
}

export async function upsertVectors(
  points: Array<{ id: string; vector: number[]; payload: ChunkMetadata }>,
): Promise<void> {
  const qdrant = getQdrantClient();
  await qdrant.upsert(COLLECTION_NAME, {
    wait: true,
    points: points.map((p) => ({
      id: p.id,
      vector: p.vector,
      payload: p.payload as unknown as Record<string, unknown>,
    })),
  });
}

export async function searchSimilarChunks(
  vector: number[],
  organizationId: string,
  topK = 5,
): Promise<ScoredChunk[]> {
  const qdrant = getQdrantClient();

  const results = await qdrant.search(COLLECTION_NAME, {
    vector,
    limit: topK,
    filter: {
      must: [
        {
          key: 'organizationId',
          match: { value: organizationId },
        },
      ],
    },
    with_payload: true,
  });

  return results.map((r) => ({
    text: (r.payload?.text as string) ?? '',
    score: r.score,
    documentId: (r.payload?.documentId as string) ?? '',
    chunkIndex: (r.payload?.chunkIndex as number) ?? 0,
  }));
}

export async function deleteDocumentVectors(
  organizationId: string,
  documentId: string,
): Promise<void> {
  const qdrant = getQdrantClient();
  await qdrant.delete(COLLECTION_NAME, {
    wait: true,
    filter: {
      must: [
        { key: 'organizationId', match: { value: organizationId } },
        { key: 'documentId', match: { value: documentId } },
      ],
    },
  });
}

export async function deleteOrganizationVectors(organizationId: string): Promise<void> {
  const qdrant = getQdrantClient();
  await qdrant.delete(COLLECTION_NAME, {
    wait: true,
    filter: {
      must: [{ key: 'organizationId', match: { value: organizationId } }],
    },
  });
}
