import { apiClient } from '@lib/apiClient';
import type {
  ApiSuccess,
  AuthResult,
  User,
  Organization,
  Document,
  Paginated,
  TokenPair,
  OrgStats,
  AdminOrganization,
  AdminUser,
} from '@appTypes/index';

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (payload: {
    email: string;
    password: string;
    organizationName: string;
    organizationSlug: string;
  }) => apiClient.post<ApiSuccess<AuthResult>>('/auth/register', payload),

  login: (payload: { email: string; password: string }) =>
    apiClient.post<ApiSuccess<AuthResult>>('/auth/login', payload),

  googleRegister: (payload: {
    idToken: string;
    organizationName: string;
    organizationSlug: string;
  }) => apiClient.post<ApiSuccess<AuthResult>>('/auth/google/register', payload),

  googleLogin: (payload: { idToken: string }) =>
    apiClient.post<ApiSuccess<AuthResult>>('/auth/google/login', payload),

  refresh: (refreshToken: string) =>
    apiClient.post<ApiSuccess<{ tokens: TokenPair }>>('/auth/refresh', { refreshToken }),

  me: () => apiClient.get<ApiSuccess<User>>('/auth/me'),
};

// ─── Organizations ───────────────────────────────────────────────────────────
export const organizationApi = {
  get: () => apiClient.get<ApiSuccess<Organization>>('/organizations'),

  getStats: () => apiClient.get<ApiSuccess<OrgStats>>('/organizations/stats'),

  update: (payload: {
    name?: string;
    settings?: Partial<Organization['settings']>;
  }) => apiClient.patch<ApiSuccess<Organization>>('/organizations', payload),

  regenerateApiKey: () =>
    apiClient.post<ApiSuccess<{ apiKey: string }>>('/organizations/regenerate-api-key'),
};

// ─── Documents ───────────────────────────────────────────────────────────────
export const documentApi = {
  list: (page = 1, limit = 20) =>
    apiClient.get<ApiSuccess<Paginated<Document>>>(`/documents?page=${page}&limit=${limit}`),

  get: (id: string) => apiClient.get<ApiSuccess<Document>>(`/documents/${id}`),

  upload: (formData: FormData) =>
    apiClient.post<ApiSuccess<Document>>('/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  delete: (id: string) => apiClient.delete<ApiSuccess<null>>(`/documents/${id}`),

  reprocess: (id: string) =>
    apiClient.post<ApiSuccess<Document>>(`/documents/${id}/reprocess`),
};

// ─── Super Admin ────────────────────────────────────────────────────────────
export const adminApi = {
  listOrganizations: (page = 1, limit = 20, search?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set('search', search);
    return apiClient.get<ApiSuccess<Paginated<AdminOrganization>>>(
      `/admin/organizations?${params.toString()}`,
    );
  },

  getOrganization: (id: string) =>
    apiClient.get<ApiSuccess<AdminOrganization>>(`/admin/organizations/${id}`),

  createOrganization: (payload: {
    name: string;
    slug: string;
    plan?: AdminOrganization['plan'];
    isActive?: boolean;
  }) => apiClient.post<ApiSuccess<AdminOrganization>>('/admin/organizations', payload),

  updateOrganization: (id: string, payload: Partial<{
    name: string;
    slug: string;
    plan: AdminOrganization['plan'];
    isActive: boolean;
  }>) => apiClient.patch<ApiSuccess<AdminOrganization>>(`/admin/organizations/${id}`, payload),

  deleteOrganization: (id: string) =>
    apiClient.delete<ApiSuccess<null>>(`/admin/organizations/${id}`),

  impersonateOrganization: (id: string) =>
    apiClient.post<ApiSuccess<{ tokens: TokenPair }>>(`/admin/organizations/${id}/impersonate`),

  listUsers: (params: { page?: number; limit?: number; search?: string; organizationId?: string; role?: string }) => {
    const query = new URLSearchParams({
      page: String(params.page ?? 1),
      limit: String(params.limit ?? 20),
    });
    if (params.search) query.set('search', params.search);
    if (params.organizationId) query.set('organizationId', params.organizationId);
    if (params.role) query.set('role', params.role);
    return apiClient.get<ApiSuccess<Paginated<AdminUser>>>(`/admin/users?${query.toString()}`);
  },

  getUser: (id: string) => apiClient.get<ApiSuccess<AdminUser>>(`/admin/users/${id}`),

  createUser: (payload: {
    email: string;
    password: string;
    role: AdminUser['role'];
    organizationId: string;
    isActive?: boolean;
  }) => apiClient.post<ApiSuccess<AdminUser>>('/admin/users', payload),

  updateUser: (id: string, payload: Partial<{
    email: string;
    password: string;
    role: AdminUser['role'];
    organizationId: string;
    isActive: boolean;
  }>) => apiClient.patch<ApiSuccess<AdminUser>>(`/admin/users/${id}`, payload),

  deleteUser: (id: string) => apiClient.delete<ApiSuccess<null>>(`/admin/users/${id}`),
};
