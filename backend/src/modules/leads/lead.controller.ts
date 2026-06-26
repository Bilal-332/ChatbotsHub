import { Request, Response } from 'express';
import { leadService } from './lead.service';
import { classifyLeadIntent } from '@core/ai/intentClassifier';
import { sendSuccess, sendCreated } from '@shared/apiResponse';
import { AppError } from '@shared/errors';
import type { AuthenticatedRequest, ApiKeyRequest } from '@shared/types';
import type { LeadStatus } from './lead.model';

const VALID_STATUSES: LeadStatus[] = ['new', 'contacted', 'qualified', 'closed'];

/**
 * Escape a value for safe inclusion in a CSV cell. Guards against CSV/formula
 * injection by neutralizing leading =, +, -, @ characters that spreadsheet
 * apps would otherwise execute.
 */
function csvCell(value: unknown): string {
  let str = value === undefined || value === null ? '' : String(value);
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  return `"${str.replace(/"/g, '""')}"`;
}

export class LeadController {
  /** Public: capture a lead from the chat widget (API-key auth). */
  async submit(req: Request, res: Response): Promise<void> {
    const organizationId = (req as ApiKeyRequest).organizationId;
    const { name, email, phone, company, message, conversationId, intent } = req.body as {
      name: string;
      email: string;
      phone?: string;
      company?: string;
      message?: string;
      conversationId?: string;
      intent?: string;
    };

    const lead = await leadService.create(organizationId, {
      name,
      email,
      phone,
      company,
      message,
      conversationId,
      intent,
    });

    sendCreated(res, { id: lead._id.toString() }, 'Thanks! We will be in touch shortly.');
  }

  /** Public: classify a visitor message intent to decide whether to show the lead form. */
  async classifyIntent(req: Request, res: Response): Promise<void> {
    const { message } = req.body as { message?: unknown };

    if (typeof message !== 'string') {
      throw new AppError('message is required', 400, 'INVALID_INPUT');
    }

    const result = await classifyLeadIntent(message);
    sendSuccess(res, result);
  }

  /** Dashboard: list leads with optional status filter (JWT auth). */
  async list(req: Request, res: Response): Promise<void> {
    const { organizationId } = (req as AuthenticatedRequest).user;
    const page = parseInt(req.query['page'] as string, 10) || 1;
    const limit = Math.min(parseInt(req.query['limit'] as string, 10) || 20, 100);
    const status = this.parseStatus(req.query['status']);

    const result = await leadService.list(organizationId, page, limit, status);
    sendSuccess(res, result);
  }

  /** Dashboard: update a lead's pipeline status (JWT auth). */
  async updateStatus(req: Request, res: Response): Promise<void> {
    const { organizationId } = (req as AuthenticatedRequest).user;
    const { status } = req.body as { status: string };

    if (!VALID_STATUSES.includes(status as LeadStatus)) {
      throw new AppError('Invalid lead status', 400, 'INVALID_STATUS');
    }

    const lead = await leadService.updateStatus(
      req.params['id'] ?? '',
      organizationId,
      status as LeadStatus,
    );

    sendSuccess(res, lead, 'Lead updated');
  }

  /** Dashboard: export leads as a CSV file (JWT auth). */
  async exportCsv(req: Request, res: Response): Promise<void> {
    const { organizationId } = (req as AuthenticatedRequest).user;
    const status = this.parseStatus(req.query['status']);

    const leads = await leadService.listForExport(organizationId, status);

    const header = ['Name', 'Email', 'Phone', 'Company', 'Source Bot', 'Intent', 'Status', 'Message', 'Date'];
    const rows = leads.map((lead) =>
      [
        csvCell(lead.name),
        csvCell(lead.email),
        csvCell(lead.phone),
        csvCell(lead.company),
        csvCell(lead.sourceBot),
        csvCell(lead.intent),
        csvCell(lead.status),
        csvCell(lead.message),
        csvCell(new Date(lead.createdAt).toISOString()),
      ].join(','),
    );

    const csv = [header.map(csvCell).join(','), ...rows].join('\r\n');
    const filename = `leads-${new Date().toISOString().slice(0, 10)}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(csv);
  }

  private parseStatus(raw: unknown): LeadStatus | undefined {
    if (typeof raw === 'string' && VALID_STATUSES.includes(raw as LeadStatus)) {
      return raw as LeadStatus;
    }
    return undefined;
  }
}

export const leadController = new LeadController();
