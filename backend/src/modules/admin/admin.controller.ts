import { Request, Response } from 'express';
import { adminService } from './admin.service';
import { sendCreated, sendSuccess } from '@shared/apiResponse';
import type { AuthenticatedRequest } from '@shared/types';
import { generateTokenPair } from '@modules/auth/token.service';

export class AdminController {
	async listOrganizations(req: Request, res: Response): Promise<void> {
		const page = Math.max(parseInt((req.query['page'] as string) ?? '1', 10), 1);
		const limit = Math.min(Math.max(parseInt((req.query['limit'] as string) ?? '20', 10), 1), 100);
		const search = (req.query['search'] as string) ?? undefined;

		const result = await adminService.listOrganizations({ page, limit, search });
		sendSuccess(res, result);
	}

	async getOrganization(req: Request, res: Response): Promise<void> {
		const org = await adminService.getOrganization(req.params['id'] ?? '');
		sendSuccess(res, org);
	}

	async createOrganization(req: Request, res: Response): Promise<void> {
		const org = await adminService.createOrganization(req.body);
		sendCreated(res, org, 'Organization created');
	}

	async updateOrganization(req: Request, res: Response): Promise<void> {
		const org = await adminService.updateOrganization(req.params['id'] ?? '', req.body);
		sendSuccess(res, org, 'Organization updated');
	}

	async deleteOrganization(req: Request, res: Response): Promise<void> {
		await adminService.deleteOrganization(req.params['id'] ?? '');
		sendSuccess(res, null, 'Organization deleted');
	}

	async impersonateOrganization(req: Request, res: Response): Promise<void> {
		const { userId, role } = (req as AuthenticatedRequest).user;
		const organizationId = req.params['id'] ?? '';

		await adminService.getOrganization(organizationId);

		const tokens = generateTokenPair({
			userId,
			organizationId,
			role,
		});

		sendSuccess(res, { tokens }, 'Impersonation started');
	}

	async listUsers(req: Request, res: Response): Promise<void> {
		const page = Math.max(parseInt((req.query['page'] as string) ?? '1', 10), 1);
		const limit = Math.min(Math.max(parseInt((req.query['limit'] as string) ?? '20', 10), 1), 100);
		const search = (req.query['search'] as string) ?? undefined;
		const organizationId = (req.query['organizationId'] as string) ?? undefined;
		const role = (req.query['role'] as string) ?? undefined;

		const result = await adminService.listUsers({
			page,
			limit,
			search,
			organizationId,
			role: role as any,
		});

		sendSuccess(res, result);
	}

	async getUser(req: Request, res: Response): Promise<void> {
		const user = await adminService.getUser(req.params['id'] ?? '');
		sendSuccess(res, user);
	}

	async createUser(req: Request, res: Response): Promise<void> {
		const user = await adminService.createUser(req.body);
		sendCreated(res, user, 'User created');
	}

	async updateUser(req: Request, res: Response): Promise<void> {
		const user = await adminService.updateUser(req.params['id'] ?? '', req.body);
		sendSuccess(res, user, 'User updated');
	}

	async deleteUser(req: Request, res: Response): Promise<void> {
		await adminService.deleteUser(req.params['id'] ?? '');
		sendSuccess(res, null, 'User deleted');
	}
}

export const adminController = new AdminController();
