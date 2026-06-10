import { Document as DocumentModel, IDocument } from './document.model';
import { extractTextFromUrl, detectSourceType } from './textExtractor';
import { chunkTextWithMetadata } from '@core/ai/textChunker';
import { generateEmbeddingsBatch } from '@core/ai/embeddingService';
import { upsertVectors, deleteDocumentVectors } from '@core/vector/qdrantClient';
import { NotFoundError, ForbiddenError } from '@shared/errors';
import { logger } from '@shared/logger';
import { paginate, PaginatedData } from '@shared/apiResponse';
import { v4 as uuidv4 } from 'uuid';

export class DocumentService {
  async uploadAndProcess(
    organizationId: string,
    fileUrl: string,
    originalName: string,
  ): Promise<IDocument> {
    const sourceType = detectSourceType(originalName);

    // Create DB record in 'processing' state
    const doc = await DocumentModel.create({
      organizationId,
      title: originalName,
      fileUrl,
      sourceType,
      status: 'processing',
    });

    // Process asynchronously to return fast to the user
    this.processDocumentAsync(doc._id.toString(), organizationId, fileUrl, sourceType, doc.title).catch(
      (error: unknown) => {
        logger.error(`Document processing failed for ${doc._id.toString()}:`, error);
      },
    );

    return doc;
  }

  private async processDocumentAsync(
    documentId: string,
    organizationId: string,
    fileUrl: string,
    sourceType: IDocument['sourceType'],
    documentTitle: string,
  ): Promise<void> {
    try {
      // 1. Extract text
      const text = await extractTextFromUrl(fileUrl, sourceType);

      // 2. Chunk text
      const chunks = chunkTextWithMetadata(text, {
        targetTokens: 240,
        maxTokens: 320,
        overlapTokens: 60,
      });

      if (chunks.length === 0) {
        throw new Error('No valid chunks were produced from extracted text');
      }

      // 3. Generate embeddings in batches
      const embeddings = await generateEmbeddingsBatch(chunks.map((chunk) => chunk.text));

      // 4. Upsert into Qdrant
      const points = chunks.map((chunk, i) => ({
        id: uuidv4(),
        vector: embeddings[i],
        payload: {
          organizationId,
          documentId,
          documentTitle,
          chunkIndex: i,
          section: chunk.section,
          pageNumber: chunk.pageNumber,
          text: chunk.text,
        },
      }));

      await upsertVectors(points);

      // 5. Mark document as ready
      await DocumentModel.findByIdAndUpdate(documentId, {
        status: 'ready',
        chunkCount: chunks.length,
      });

      logger.info(`Document ${documentId} processed: ${chunks.length} chunks indexed`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown processing error';
      await DocumentModel.findByIdAndUpdate(documentId, {
        status: 'failed',
        processingError: message.slice(0, 500),
      });
      logger.error(`Document ${documentId} processing failed:`, error);
    }
  }

  async listByOrganization(
    organizationId: string,
    page = 1,
    limit = 20,
  ): Promise<PaginatedData<IDocument>> {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      DocumentModel.find({ organizationId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      DocumentModel.countDocuments({ organizationId }),
    ]);

    return paginate(items as unknown as IDocument[], total, page, limit);
  }

  async getById(documentId: string, organizationId: string): Promise<IDocument> {
    const doc = await DocumentModel.findOne({ _id: documentId, organizationId });
    if (!doc) throw new NotFoundError('Document');
    return doc;
  }

  async delete(documentId: string, organizationId: string): Promise<void> {
    const doc = await DocumentModel.findOne({ _id: documentId, organizationId });
    if (!doc) throw new NotFoundError('Document');

    // Remove from vector store
    await deleteDocumentVectors(organizationId, documentId);

    await DocumentModel.findByIdAndDelete(documentId);
    logger.info(`Document ${documentId} and its vectors deleted`);
  }

  async reprocessDocument(documentId: string, organizationId: string): Promise<IDocument> {
    const doc = await DocumentModel.findOne({ _id: documentId, organizationId });
    if (!doc) throw new NotFoundError('Document');

    // Only retry failed documents
    if (doc.status !== 'failed') {
      throw new ForbiddenError('Only failed documents can be reprocessed');
    }

    // Clear old vectors before reprocessing
    await deleteDocumentVectors(organizationId, documentId);

    await DocumentModel.findByIdAndUpdate(documentId, {
      status: 'processing',
      processingError: undefined,
      chunkCount: 0,
    });

    logger.info(`Reprocessing queued for document ${documentId}`);
    return doc;
  }
}

export const documentService = new DocumentService();
