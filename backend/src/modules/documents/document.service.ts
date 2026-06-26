import { Document as DocumentModel, IDocument } from './document.model';
import { extractTextFromUrl, detectSourceType } from './textExtractor';
import { crawlWebsite } from './websiteCrawler';
import { chunkTextWithMetadata } from '@core/ai/textChunker';
import { generateEmbeddingsBatch } from '@core/ai/embeddingService';
import { upsertVectors, deleteDocumentVectors } from '@core/vector/qdrantClient';
import { NotFoundError, ForbiddenError } from '@shared/errors';
import { logger } from '@shared/logger';
import { paginate, PaginatedData } from '@shared/apiResponse';
import { Organization } from '@modules/organizations/organization.model';
import { PLAN_LIMITS } from '@modules/plans/plan.constants';
import { v4 as uuidv4 } from 'uuid';

/**
 * Resolve the per-plan website crawl page limit for an organization, falling
 * back to the free-tier limit when the org/plan cannot be determined.
 */
export async function resolveCrawlPageLimit(organizationId: string): Promise<number> {
  const org = await Organization.findById(organizationId).select('plan').lean();
  const plan = org?.plan ?? 'free';
  return PLAN_LIMITS[plan].maxCrawlPages;
}

/**
 * Turn a filename/title into clean searchable words (drop extension, turn
 * separators into spaces). e.g. "Muhammad_Bilal_Resume.pdf" -> "Muhammad Bilal Resume".
 */
function cleanTitleForEmbedding(title: string): string {
  return title
    .replace(/\.[^.]+$/, '')
    .replace(/[_\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Build the text that is actually embedded for a chunk. We prepend the document
 * title and the chunk's section heading so that anchors like the person's name
 * (often the top-of-document heading) and section titles ("Projects",
 * "Experience", "Address") are present in the vector. Headings are otherwise
 * stripped from chunk bodies by the chunker, which makes those queries
 * un-retrievable. The stored payload still keeps the raw chunk text.
 */
function buildEmbeddingInput(title: string, section: string | undefined, text: string): string {
  const cleanTitle = cleanTitleForEmbedding(title);
  const parts = [cleanTitle, section?.trim(), text].filter(
    (part): part is string => Boolean(part && part.length > 0),
  );
  return parts.join('\n');
}

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
      // 1. Extract text from the uploaded file (PDF/DOCX/TXT).
      const text = await extractTextFromUrl(fileUrl, sourceType);

      // 2-5. Reuse the shared chunk → embed → upsert → mark-ready pipeline.
      await this.indexText(documentId, organizationId, documentTitle, text);
    } catch (error) {
      await this.markProcessingFailed(documentId, error);
    }
  }

  /**
   * Shared ingestion pipeline used by BOTH file uploads and website-URL
   * training. Takes already-extracted plain text and turns it into searchable
   * vectors. This is the single embedding/storage path — no duplicated logic.
   */
  private async indexText(
    documentId: string,
    organizationId: string,
    documentTitle: string,
    text: string,
  ): Promise<void> {
    // Chunk text (same settings the document pipeline has always used).
    const chunks = chunkTextWithMetadata(text, {
      targetTokens: 240,
      maxTokens: 320,
      overlapTokens: 60,
    });

    if (chunks.length === 0) {
      throw new Error('No valid chunks were produced from extracted text');
    }

    // Generate embeddings in batches. Embed an enriched string (title + section
    // + body) so headings/name are searchable, but keep the raw chunk text for
    // storage and LLM context.
    const embeddings = await generateEmbeddingsBatch(
      chunks.map((chunk) => buildEmbeddingInput(documentTitle, chunk.section, chunk.text)),
    );

    // Upsert into Qdrant.
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

    // Mark document as ready.
    await DocumentModel.findByIdAndUpdate(documentId, {
      status: 'ready',
      chunkCount: chunks.length,
    });

    logger.info(`Document ${documentId} processed: ${chunks.length} chunks indexed`);
  }

  private async markProcessingFailed(documentId: string, error: unknown): Promise<void> {
    const message = error instanceof Error ? error.message : 'Unknown processing error';
    await DocumentModel.findByIdAndUpdate(documentId, {
      status: 'failed',
      processingError: message.slice(0, 500),
    });
    logger.error(`Document ${documentId} processing failed:`, error);
  }

  /**
   * Train the chatbot from a website URL. Creates a document record immediately
   * and crawls + indexes the site in the background, mirroring the file upload
   * flow so the rest of the platform (retrieval, deletion, limits) treats a
   * website source exactly like any other knowledge document.
   */
  async trainFromUrl(organizationId: string, url: string, maxPages: number): Promise<IDocument> {
    let hostname = url;
    try {
      hostname = new URL(url).hostname;
    } catch {
      // Validation in the controller already guarantees a parseable URL; this is
      // only a defensive fallback for the human-readable title.
    }

    const doc = await DocumentModel.create({
      organizationId,
      title: hostname,
      fileUrl: url,
      sourceUrl: url,
      sourceType: 'url',
      status: 'processing',
    });

    this.processUrlAsync(doc._id.toString(), organizationId, url, maxPages).catch(
      (error: unknown) => {
        logger.error(`Website processing failed for ${doc._id.toString()}:`, error);
      },
    );

    return doc;
  }

  private async processUrlAsync(
    documentId: string,
    organizationId: string,
    url: string,
    maxPages: number,
  ): Promise<void> {
    try {
      // 1. Crawl + clean the website into plain text.
      const crawl = await crawlWebsite(url, maxPages);

      // Use the crawled site title (when available) for a friendlier label.
      const documentTitle = crawl.title || url;
      await DocumentModel.findByIdAndUpdate(documentId, {
        title: documentTitle.slice(0, 200),
        pagesCrawled: crawl.pagesCrawled,
      });

      // 2-5. Reuse the exact same chunk → embed → upsert pipeline as files.
      await this.indexText(documentId, organizationId, documentTitle, crawl.text);
    } catch (error) {
      await this.markProcessingFailed(documentId, error);
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

    const updated = await DocumentModel.findByIdAndUpdate(
      documentId,
      {
        $set: { status: 'processing', chunkCount: 0 },
        $unset: { processingError: 1 },
      },
      { new: true },
    );

    // Actually re-run extraction → chunking → embedding → indexing.
    // Without this the document would stay stuck in "processing" forever.
    // Website sources re-crawl; file sources re-download and re-extract.
    if (doc.sourceType === 'url') {
      const maxPages = await resolveCrawlPageLimit(organizationId);
      this.processUrlAsync(documentId, organizationId, doc.sourceUrl ?? doc.fileUrl, maxPages).catch(
        (error: unknown) => {
          logger.error(`Website reprocessing failed for ${documentId}:`, error);
        },
      );
    } else {
      this.processDocumentAsync(
        documentId,
        organizationId,
        doc.fileUrl,
        doc.sourceType,
        doc.title,
      ).catch((error: unknown) => {
        logger.error(`Document reprocessing failed for ${documentId}:`, error);
      });
    }

    logger.info(`Reprocessing started for document ${documentId}`);
    return updated ?? doc;
  }
}

export const documentService = new DocumentService();
