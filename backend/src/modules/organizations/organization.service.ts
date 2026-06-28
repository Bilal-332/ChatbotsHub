import { Organization, IOrganization } from './organization.model';
import { ConflictError, NotFoundError, ForbiddenError } from '@shared/errors';
import { deleteOrganizationVectors } from '@core/vector/qdrantClient';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import { deleteCloudinaryImage, uploadImageToCloudinary } from '@core/cloudinary.config';

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

    const existingOrg = dto.settings?.avatarUrl !== undefined
      ? await Organization.findById(id).select('settings.avatarUrl').lean()
      : null;

    const updatePayload: Record<string, unknown> = {};
    if (dto.name) updatePayload.name = dto.name;

    if (dto.settings) {
      for (const [key, value] of Object.entries(dto.settings)) {
        if (value !== undefined) {
          updatePayload[`settings.${key}`] = value;
        }
      }
    }

    const org = await Organization.findByIdAndUpdate(
      id,
      { $set: updatePayload },
      { new: true, runValidators: true },
    );

    if (!org) throw new NotFoundError('Organization');

    if (
      dto.settings?.avatarUrl !== undefined
      && dto.settings.avatarUrl.trim() === ''
      && existingOrg?.settings?.avatarUrl?.trim()
    ) {
      await deleteCloudinaryImage(existingOrg.settings.avatarUrl).catch(() => undefined);
    }

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

  async uploadAvatar(
    id: string,
    requestingOrgId: string,
    filePath: string,
    previousAvatarUrl?: string,
  ): Promise<string> {
    if (id !== requestingOrgId) throw new ForbiddenError();

    let uploadedAvatarUrl: string | null = null;

    try {
      const uploaded = await uploadImageToCloudinary(filePath, 'chatbotshub/avatars');
      uploadedAvatarUrl = uploaded.secureUrl;

      const org = await Organization.findByIdAndUpdate(
        id,
        { $set: { 'settings.avatarUrl': uploaded.secureUrl } },
        { new: true, runValidators: true },
      );

      if (!org) throw new NotFoundError('Organization');

      if (previousAvatarUrl) {
        await deleteCloudinaryImage(previousAvatarUrl).catch(() => undefined);
      }

      return uploaded.secureUrl;
    } catch (error) {
      if (uploadedAvatarUrl) {
        await deleteCloudinaryImage(uploadedAvatarUrl).catch(() => undefined);
      }
      throw error;
    } finally {
      await fs.unlink(filePath).catch(() => undefined);
    }
  }
}

export const organizationService = new OrganizationService();
