import { Request, Response } from 'express';
import { documentService, resolveCrawlPageLimit } from './document.service';
import { assertSafePublicUrl } from './urlValidator';
import { sendSuccess, sendCreated } from '@shared/apiResponse';
import { AppError } from '@shared/errors';
import type { AuthenticatedRequest } from '@shared/types';
import { isCloudinaryUrl } from '@core/cloudinary.config';

export class DocumentController {
  async upload(req: Request, res: Response): Promise<void> {
    const { organizationId } = (req as AuthenticatedRequest).user;
    const { fileUrl, originalName } = req.body as {
      fileUrl?: unknown;
      originalName?: unknown;
    };

    if (typeof fileUrl !== 'string' || !fileUrl.trim()) {
      throw new AppError('fileUrl is required', 400, 'MISSING_FILE_URL');
    }

    if (typeof originalName !== 'string' || !originalName.trim()) {
      throw new AppError('originalName is required', 400, 'MISSING_ORIGINAL_NAME');
    }

    if (!isCloudinaryUrl(fileUrl)) {
      throw new AppError('Invalid Cloudinary fileUrl', 400, 'INVALID_FILE_URL');
    }

    const doc = await documentService.uploadAndProcess(
      organizationId,
      fileUrl.trim(),
      originalName.trim(),
    );

    sendCreated(res, doc, 'Document uploaded and processing started');
  }

  async trainUrl(req: Request, res: Response): Promise<void> {
    const { organizationId } = (req as AuthenticatedRequest).user;
    const { url } = req.body as { url?: unknown };

    if (typeof url !== 'string' || !url.trim()) {
      throw new AppError('A website URL is required', 400, 'INVALID_URL');
    }

    // SSRF-safe validation: rejects localhost, private/internal IPs, and hosts
    // that resolve to private networks. Throws a 400 AppError when unsafe.
    const validated = await assertSafePublicUrl(url.trim());

    // The plan-limit middleware attaches the per-plan page cap.
    const maxPages =
      (req as Request & { crawlPageLimit?: number }).crawlPageLimit ??
      (await resolveCrawlPageLimit(organizationId));

    const doc = await documentService.trainFromUrl(organizationId, validated.url, maxPages);

    sendCreated(res, doc, 'Website training started');
  }

  async list(req: Request, res: Response): Promise<void> {
    const { organizationId } = (req as AuthenticatedRequest).user;
    const page = parseInt(req.query['page'] as string, 10) || 1;
    const limit = Math.min(parseInt(req.query['limit'] as string, 10) || 20, 100);

    const result = await documentService.listByOrganization(organizationId, page, limit);
    sendSuccess(res, result);
  }

  async getOne(req: Request, res: Response): Promise<void> {
    const { organizationId } = (req as AuthenticatedRequest).user;
    const doc = await documentService.getById(req.params['id'] ?? '', organizationId);
    sendSuccess(res, doc);
  }

  async delete(req: Request, res: Response): Promise<void> {
    const { organizationId } = (req as AuthenticatedRequest).user;
    await documentService.delete(req.params['id'] ?? '', organizationId);
    sendSuccess(res, null, 'Document deleted');
  }

  async reprocess(req: Request, res: Response): Promise<void> {
    const { organizationId } = (req as AuthenticatedRequest).user;
    const doc = await documentService.reprocessDocument(req.params['id'] ?? '', organizationId);
    sendSuccess(res, doc, 'Reprocessing initiated');
  }
}

export const documentController = new DocumentController();
