import { Request, Response } from 'express';
import { organizationService } from './organization.service';
import { Organization } from './organization.model';
import { sendSuccess } from '@shared/apiResponse';
import { NotFoundError } from '@shared/errors';
import type { AuthenticatedRequest } from '@shared/types';
import { PLAN_LIMITS } from '@modules/plans/plan.constants';
import { checkAndApplyPlanExpiry } from '@modules/plans/plan.service';

export class OrganizationController {
  async getMyOrganization(req: Request, res: Response): Promise<void> {
    const { organizationId } = (req as AuthenticatedRequest).user;
    const planWarning = await checkAndApplyPlanExpiry(organizationId);
    const org = await organizationService.findById(organizationId);
    sendSuccess(res, { ...org.toObject(), planExpiryWarning: planWarning });
  }

  async getStats(req: Request, res: Response): Promise<void> {
    const { organizationId } = (req as AuthenticatedRequest).user;
    await checkAndApplyPlanExpiry(organizationId);
    const stats = await organizationService.getStats(organizationId);
    const limits = PLAN_LIMITS[stats.plan as keyof typeof PLAN_LIMITS];
    const planWarning = await checkAndApplyPlanExpiry(organizationId);
    sendSuccess(res, { ...stats, limits, planExpiryWarning: planWarning });
  }

  async updateOrganization(req: Request, res: Response): Promise<void> {
    const { organizationId } = (req as AuthenticatedRequest).user;
    const org = await organizationService.update(organizationId, organizationId, req.body);
    sendSuccess(res, org, 'Organization updated');
  }

  async regenerateApiKey(req: Request, res: Response): Promise<void> {
    const { organizationId } = (req as AuthenticatedRequest).user;
    const newApiKey = await organizationService.regenerateApiKey(
      organizationId,
      organizationId,
    );
    sendSuccess(res, { apiKey: newApiKey }, 'API key regenerated');
  }

  /**
   * Public endpoint consumed by the chat widget to fetch chatbot display settings.
   * Exposes only cosmetic settings - no sensitive data.
   */
  async getPublicSettings(req: Request, res: Response): Promise<void> {
    const apiKey = req.query['apiKey'] as string;
    const org = await Organization.findOne({ apiKey, isActive: true })
      .select('settings')
      .lean();

    if (!org) throw new NotFoundError('Organization');

    sendSuccess(res, {
      chatbotName: org.settings.chatbotName,
      welcomeMessage: org.settings.welcomeMessage,
      primaryColor: org.settings.primaryColor,
      avatarUrl: org.settings.avatarUrl?.trim() || null,
      language: org.settings.language ?? 'auto',
    });
  }

  async uploadAvatar(req: Request, res: Response): Promise<void> {
    const { organizationId } = (req as AuthenticatedRequest).user;
    const file = req.file;

    if (!file) {
      throw new NotFoundError('Avatar file');
    }

    const org = await Organization.findById(organizationId).select('settings.avatarUrl').lean();
    const avatarUrl = await organizationService.uploadAvatar(
      organizationId,
      organizationId,
      file.path,
      org?.settings?.avatarUrl,
    );

    sendSuccess(res, { avatarUrl }, 'Avatar uploaded');
  }
}

export const organizationController = new OrganizationController();
