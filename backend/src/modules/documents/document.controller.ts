import { Request, Response } from 'express';
import { documentService } from './document.service';
import { sendSuccess, sendCreated } from '@shared/apiResponse';
import { AppError } from '@shared/errors';
import type { AuthenticatedRequest } from '@shared/types';

export class DocumentController {
  async upload(req: Request, res: Response): Promise<void> {
    const { organizationId } = (req as AuthenticatedRequest).user;

    if (!req.file) {
      throw new AppError('No file uploaded', 400, 'NO_FILE');
    }

    const doc = await documentService.uploadAndProcess(
      organizationId,
      req.file.path,
      req.file.originalname,
    );

    sendCreated(res, doc, 'Document uploaded and processing started');
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
