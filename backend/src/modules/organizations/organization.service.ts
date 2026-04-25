import { Organization, IOrganization } from './organization.model';
import { ConflictError, NotFoundError, ForbiddenError } from '@shared/errors';
import { deleteOrganizationVectors } from '@core/vector/qdrantClient';
import { v4 as uuidv4 } from 'uuid';

export interface CreateOrganizationDto {
  name: string;
  slug: string;
}

export interface UpdateOrganizationDto {
  name?: string;
  settings?: Partial<IOrganization['settings']>;
}

export class OrganizationService {
  async create(dto: CreateOrganizationDto): Promise<IOrganization> {
    const existing = await Organization.findOne({ slug: dto.slug });
    if (existing) {
      throw new ConflictError(`Slug "${dto.slug}" is already taken`);
    }

    const org = await Organization.create({
      name: dto.name,
      slug: dto.slug,
    });

    return org;
  }

  async findById(id: string): Promise<IOrganization> {
    const org = await Organization.findById(id);
    if (!org) throw new NotFoundError('Organization');
    return org;
  }

  async update(
    id: string,
    requestingOrgId: string,
    dto: UpdateOrganizationDto,
  ): Promise<IOrganization> {
    if (id !== requestingOrgId) throw new ForbiddenError();

    const org = await Organization.findByIdAndUpdate(
      id,
      {
        ...(dto.name && { name: dto.name }),
        ...(dto.settings && { settings: dto.settings }),
      },
      { new: true, runValidators: true },
    );

    if (!org) throw new NotFoundError('Organization');
    return org;
  }

  async regenerateApiKey(id: string, requestingOrgId: string): Promise<string> {
    if (id !== requestingOrgId) throw new ForbiddenError();

    const newApiKey = `chk_${uuidv4().replace(/-/g, '')}`;
    const org = await Organization.findByIdAndUpdate(
      id,
      { apiKey: newApiKey },
      { new: true },
    );

    if (!org) throw new NotFoundError('Organization');
    return newApiKey;
  }

  async getStats(id: string): Promise<{
    plan: string;
    monthlyQueryCount: number;
    queryResetAt: Date;
  }> {
    const org = await Organization.findById(id)
      .select('plan monthlyQueryCount queryResetAt')
      .lean();
    if (!org) throw new NotFoundError('Organization');

    return {
      plan: org.plan,
      monthlyQueryCount: org.monthlyQueryCount,
      queryResetAt: org.queryResetAt,
    };
  }

  async deactivate(id: string, requestingOrgId: string): Promise<void> {
    if (id !== requestingOrgId) throw new ForbiddenError();

    await Organization.findByIdAndUpdate(id, { isActive: false });
    // Clean up all vector embeddings for this organization
    await deleteOrganizationVectors(id);
  }
}

export const organizationService = new OrganizationService();
