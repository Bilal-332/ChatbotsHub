import { Lead, ILead, LeadStatus } from './lead.model';
import { Organization } from '@modules/organizations/organization.model';
import { User } from '@modules/auth/user.model';
import { NotFoundError } from '@shared/errors';
import { logger } from '@shared/logger';
import { paginate, PaginatedData } from '@shared/apiResponse';
import { sendLeadNotificationEmail } from '@shared/mailer';
import { config } from '@shared/config';

export interface CreateLeadDto {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message?: string;
  conversationId?: string;
  intent?: string;
}

export class LeadService {
  async create(organizationId: string, dto: CreateLeadDto): Promise<ILead> {
    const org = await Organization.findById(organizationId)
      .select('settings.chatbotName')
      .lean();

    const sourceBot = org?.settings?.chatbotName?.trim() || 'AI Assistant';

    const lead = await Lead.create({
      organizationId,
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      company: dto.company,
      message: dto.message,
      conversationId: dto.conversationId,
      intent: dto.intent,
      sourceBot,
      status: 'new',
    });

    // Notify the org admin without blocking the lead-capture response.
    this.notifyAdmin(organizationId, lead, sourceBot).catch((error: unknown) => {
      logger.error(`Lead notification failed for ${lead._id.toString()}:`, error);
    });

    return lead;
  }

  private async notifyAdmin(
    organizationId: string,
    lead: ILead,
    sourceBot: string,
  ): Promise<void> {
    // Email is optional infrastructure — skip silently if Resend isn't configured.
    if (!config.resend.apiKey || !config.resend.from) {
      return;
    }

    const admin = await User.findOne({
      organizationId,
      role: 'admin',
      isActive: true,
    })
      .sort({ createdAt: 1 })
      .select('email')
      .lean();

    if (!admin?.email) {
      return;
    }

    await sendLeadNotificationEmail(admin.email, {
      leadName: lead.name,
      leadEmail: lead.email,
      phone: lead.phone,
      company: lead.company,
      message: lead.message,
      intent: lead.intent,
      botName: sourceBot,
    });
  }

  async list(
    organizationId: string,
    page = 1,
    limit = 20,
    status?: LeadStatus,
  ): Promise<PaginatedData<ILead>> {
    const skip = (page - 1) * limit;
    const filter: Record<string, unknown> = { organizationId };
    if (status) {
      filter['status'] = status;
    }

    const [items, total] = await Promise.all([
      Lead.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Lead.countDocuments(filter),
    ]);

    return paginate(items as unknown as ILead[], total, page, limit);
  }

  async updateStatus(
    leadId: string,
    organizationId: string,
    status: LeadStatus,
  ): Promise<ILead> {
    const lead = await Lead.findOneAndUpdate(
      { _id: leadId, organizationId },
      { status },
      { new: true },
    );

    if (!lead) {
      throw new NotFoundError('Lead');
    }

    return lead;
  }

  async listForExport(organizationId: string, status?: LeadStatus): Promise<ILead[]> {
    const filter: Record<string, unknown> = { organizationId };
    if (status) {
      filter['status'] = status;
    }
    return Lead.find(filter).sort({ createdAt: -1 }).lean() as unknown as Promise<ILead[]>;
  }
}

export const leadService = new LeadService();
