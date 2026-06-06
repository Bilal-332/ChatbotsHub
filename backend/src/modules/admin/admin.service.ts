import type { FilterQuery } from 'mongoose';
import { Organization, type IOrganization } from '@modules/organizations/organization.model';
import { User, type IUser, hashPassword } from '@modules/auth/user.model';
import { paginate, type PaginatedData } from '@shared/apiResponse';
import { ConflictError, NotFoundError } from '@shared/errors';
import { deleteOrganizationVectors } from '@core/vector/qdrantClient';
import type { UserRole } from '@shared/types';
import { assignPaidPlan } from '@modules/plans/plan.service';

export interface ListQuery {
	page: number;
	limit: number;
	search?: string;
}

export interface ListUsersQuery extends ListQuery {
	organizationId?: string;
	role?: UserRole;
}

export interface CreateOrganizationDto {
	name: string;
	slug: string;
	plan?: IOrganization['plan'];
	isActive?: boolean;
}

export interface UpdateOrganizationDto {
	name?: string;
	slug?: string;
	plan?: IOrganization['plan'];
	isActive?: boolean;
}

export interface CreateUserDto {
	email: string;
	password: string;
	role: UserRole;
	organizationId: string;
	isActive?: boolean;
}

export interface UpdateUserDto {
	email?: string;
	password?: string;
	role?: UserRole;
	organizationId?: string;
	isActive?: boolean;
}

type OrgSnapshot = {
	_id: { toString: () => string };
	name: string;
	slug: string;
	plan: string;
	isActive: boolean;
};

export class AdminService {
	async listOrganizations(query: ListQuery): Promise<PaginatedData<Record<string, unknown>>> {
		const filter: FilterQuery<IOrganization> = {};
		if (query.search) {
			const regex = new RegExp(query.search, 'i');
			filter.$or = [{ name: regex }, { slug: regex }];
		}

		const [items, total] = await Promise.all([
			Organization.find(filter)
				.sort({ createdAt: -1 })
				.skip((query.page - 1) * query.limit)
				.limit(query.limit)
				.lean<Record<string, unknown>>(),
			Organization.countDocuments(filter),
		]);

		return paginate<Record<string, unknown>>(
			items as unknown as Record<string, unknown>[],
			total,
			query.page,
			query.limit,
		);
	}

	async getOrganization(id: string): Promise<Record<string, unknown>> {
		const org = await Organization.findById(id).lean<Record<string, unknown>>();
		if (!org) throw new NotFoundError('Organization');
		return org as Record<string, unknown>;
	}

	async createOrganization(dto: CreateOrganizationDto): Promise<IOrganization> {
		const existing = await Organization.findOne({ slug: dto.slug });
		if (existing) throw new ConflictError(`Organization slug "${dto.slug}" is taken`);

		const org = await Organization.create({
			name: dto.name,
			slug: dto.slug,
			...(typeof dto.isActive === 'boolean' && { isActive: dto.isActive }),
		});

		if (dto.plan) {
			await assignPaidPlan(org._id.toString(), dto.plan);
		}

		return (await Organization.findById(org._id)) as IOrganization;
	}

	async updateOrganization(id: string, dto: UpdateOrganizationDto): Promise<IOrganization> {
		if (dto.slug) {
			const existing = await Organization.findOne({ slug: dto.slug, _id: { $ne: id } });
			if (existing) throw new ConflictError(`Organization slug "${dto.slug}" is taken`);
		}

		const updateFields: Record<string, unknown> = {};
		if (dto.name) updateFields.name = dto.name;
		if (dto.slug) updateFields.slug = dto.slug;
		if (typeof dto.isActive === 'boolean') updateFields.isActive = dto.isActive;

		// Handle plan changes with expiry logic separately
		if (dto.plan) {
			await assignPaidPlan(id, dto.plan);
		}

		const org = await Organization.findByIdAndUpdate(
			id,
			updateFields,
			{ new: true, runValidators: true },
		);

		if (!org) throw new NotFoundError('Organization');
		return org;
	}

	async deleteOrganization(id: string): Promise<void> {
		const org = await Organization.findByIdAndDelete(id);
		if (!org) throw new NotFoundError('Organization');

		await User.deleteMany({ organizationId: id });
		await deleteOrganizationVectors(id);
	}

	async listUsers(query: ListUsersQuery): Promise<PaginatedData<Record<string, unknown>>> {
		const filter: FilterQuery<IUser> = {};

		if (query.search) {
			filter.email = new RegExp(query.search, 'i');
		}
		if (query.organizationId) {
			filter.organizationId = query.organizationId;
		}
		if (query.role) {
			filter.role = query.role;
		}

		const [items, total] = await Promise.all([
			User.find(filter)
				.sort({ createdAt: -1 })
				.skip((query.page - 1) * query.limit)
				.limit(query.limit)
				.populate('organizationId', 'name slug plan isActive')
				.lean(),
			User.countDocuments(filter),
		]);

		const mapped = items.map((user) => {
			const populatedOrg =
				user.organizationId && typeof user.organizationId === 'object'
					? (user.organizationId as unknown as OrgSnapshot)
					: null;

			const organization = populatedOrg
				? {
						_id: populatedOrg._id.toString(),
						name: populatedOrg.name,
						slug: populatedOrg.slug,
						plan: populatedOrg.plan,
						isActive: populatedOrg.isActive,
					}
				: null;

			return {
				...user,
				_id: user._id.toString(),
				organizationId: organization?._id ?? user.organizationId?.toString?.(),
				organization,
			};
		});

		return paginate(mapped, total, query.page, query.limit);
	}

	async getUser(id: string): Promise<Record<string, unknown>> {
		const user = await User.findById(id)
			.populate('organizationId', 'name slug plan isActive')
			.lean();
		if (!user) throw new NotFoundError('User');

		const populatedOrg =
			user.organizationId && typeof user.organizationId === 'object'
				? (user.organizationId as unknown as OrgSnapshot)
				: null;

		const organization = populatedOrg
			? {
					_id: populatedOrg._id.toString(),
					name: populatedOrg.name,
					slug: populatedOrg.slug,
					plan: populatedOrg.plan,
					isActive: populatedOrg.isActive,
				}
			: null;

		return {
			...user,
			_id: user._id.toString(),
			organizationId: organization?._id ?? user.organizationId?.toString?.(),
			organization,
		};
	}

	async createUser(dto: CreateUserDto): Promise<IUser> {
		const existing = await User.findOne({ email: dto.email.toLowerCase() });
		if (existing) throw new ConflictError('Email already registered');

		const org = await Organization.findById(dto.organizationId).lean();
		if (!org) throw new NotFoundError('Organization');

		const passwordHash = await hashPassword(dto.password);
		const user = await User.create({
			email: dto.email.toLowerCase(),
			passwordHash,
			authProvider: 'password',
			role: dto.role,
			organizationId: dto.organizationId,
			...(typeof dto.isActive === 'boolean' && { isActive: dto.isActive }),
		});

		return user;
	}

	async updateUser(id: string, dto: UpdateUserDto): Promise<IUser> {
		if (dto.email) {
			const existing = await User.findOne({
				email: dto.email.toLowerCase(),
				_id: { $ne: id },
			});
			if (existing) throw new ConflictError('Email already registered');
		}

		if (dto.organizationId) {
			const org = await Organization.findById(dto.organizationId).lean();
			if (!org) throw new NotFoundError('Organization');
		}

		const update: Partial<IUser> & { passwordHash?: string } = {
			...(dto.email && { email: dto.email.toLowerCase() }),
			...(dto.role && { role: dto.role }),
			...(dto.organizationId && { organizationId: dto.organizationId as any }),
			...(typeof dto.isActive === 'boolean' && { isActive: dto.isActive }),
		};

		if (dto.password) {
			update.passwordHash = await hashPassword(dto.password);
		}

		const user = await User.findByIdAndUpdate(id, update, { new: true, runValidators: true });
		if (!user) throw new NotFoundError('User');
		return user;
	}

	async deleteUser(id: string): Promise<void> {
		const user = await User.findByIdAndDelete(id);
		if (!user) throw new NotFoundError('User');
	}
}

export const adminService = new AdminService();
