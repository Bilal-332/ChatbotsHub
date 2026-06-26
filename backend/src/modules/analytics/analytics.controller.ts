import { Request, Response } from 'express';
import { analyticsService, type AnalyticsRange } from './analytics.service';
import { sendSuccess } from '@shared/apiResponse';
import type { AuthenticatedRequest } from '@shared/types';

const VALID_RANGES: AnalyticsRange[] = ['today', '7d', '30d', '90d', 'custom'];

export class AnalyticsController {
  private resolve(req: Request) {
    const { organizationId } = (req as AuthenticatedRequest).user;
    const rawRange = req.query['range'];
    const range: AnalyticsRange =
      typeof rawRange === 'string' && VALID_RANGES.includes(rawRange as AnalyticsRange)
        ? (rawRange as AnalyticsRange)
        : '30d';
    const from = typeof req.query['from'] === 'string' ? req.query['from'] : undefined;
    const to = typeof req.query['to'] === 'string' ? req.query['to'] : undefined;

    return {
      organizationId,
      dateRange: analyticsService.resolveRange(range, from, to),
    };
  }

  async overview(req: Request, res: Response): Promise<void> {
    const { organizationId, dateRange } = this.resolve(req);
    sendSuccess(res, await analyticsService.getOverview(organizationId, dateRange));
  }

  async engagement(req: Request, res: Response): Promise<void> {
    const { organizationId, dateRange } = this.resolve(req);
    sendSuccess(res, await analyticsService.getEngagement(organizationId, dateRange));
  }

  async knowledge(req: Request, res: Response): Promise<void> {
    const { organizationId, dateRange } = this.resolve(req);
    sendSuccess(res, await analyticsService.getKnowledge(organizationId, dateRange));
  }

  async topQuestions(req: Request, res: Response): Promise<void> {
    const { organizationId, dateRange } = this.resolve(req);
    const limit = Math.min(parseInt(req.query['limit'] as string, 10) || 10, 50);
    sendSuccess(res, await analyticsService.getTopQuestions(organizationId, dateRange, limit));
  }

  async timeseries(req: Request, res: Response): Promise<void> {
    const { organizationId, dateRange } = this.resolve(req);
    sendSuccess(res, await analyticsService.getTimeSeries(organizationId, dateRange));
  }

  async leads(req: Request, res: Response): Promise<void> {
    const { organizationId, dateRange } = this.resolve(req);
    sendSuccess(res, await analyticsService.getLeadStats(organizationId, dateRange));
  }
}

export const analyticsController = new AnalyticsController();
