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
  Lead,
  LeadStatus,
  AnalyticsRange,
  AnalyticsOverview,
  AnalyticsEngagement,
  AnalyticsKnowledge,
  TopQuestion,
  TimeSeriesPoint,
  AnalyticsLeadStats,
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

  forgotPassword: (email: string) =>
    apiClient.post<ApiSuccess<null>>('/auth/forgot-password', { email }),

  resetPassword: (payload: { email: string; code: string; password: string }) =>
    apiClient.post<ApiSuccess<null>>('/auth/reset-password', payload),
};

// ─── Contact ─────────────────────────────────────────────────────────────────
export const contactApi = {
  submit: (payload: {
    name: string;
    email: string;
    message: string;
    company?: string;
    website?: string;
  }) => apiClient.post<ApiSuccess<null>>('/contact', payload),
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

  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return apiClient.post<ApiSuccess<{ avatarUrl: string }>>('/organizations/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// ─── Documents ───────────────────────────────────────────────────────────────
export const documentApi = {
  list: (page = 1, limit = 20) =>
    apiClient.get<ApiSuccess<Paginated<Document>>>(`/documents?page=${page}&limit=${limit}`),

  get: (id: string) => apiClient.get<ApiSuccess<Document>>(`/documents/${id}`),

  upload: (payload: { fileUrl: string; originalName: string }) =>
    apiClient.post<ApiSuccess<Document>>('/documents', payload),

  trainUrl: (payload: { url: string }) =>
    apiClient.post<ApiSuccess<Document>>('/documents/url', payload),

  delete: (id: string) => apiClient.delete<ApiSuccess<null>>(`/documents/${id}`),

  reprocess: (id: string) =>
    apiClient.post<ApiSuccess<Document>>(`/documents/${id}/reprocess`),
};

// ─── Leads ───────────────────────────────────────────────────────────────────
export const leadApi = {
  list: (params: { page?: number; limit?: number; status?: LeadStatus } = {}) => {
    const query = new URLSearchParams({
      page: String(params.page ?? 1),
      limit: String(params.limit ?? 20),
    });
    if (params.status) query.set('status', params.status);
    return apiClient.get<ApiSuccess<Paginated<Lead>>>(`/leads?${query.toString()}`);
  },

  updateStatus: (id: string, status: LeadStatus) =>
    apiClient.patch<ApiSuccess<Lead>>(`/leads/${id}`, { status }),

  exportUrl: (status?: LeadStatus) => {
    const query = new URLSearchParams();
    if (status) query.set('status', status);
    const qs = query.toString();
    return `/leads/export${qs ? `?${qs}` : ''}`;
  },

  exportCsv: (status?: LeadStatus) => {
    const query = new URLSearchParams();
    if (status) query.set('status', status);
    const qs = query.toString();
    return apiClient.get(`/leads/export${qs ? `?${qs}` : ''}`, { responseType: 'blob' });
  },
};

// ─── Analytics ────────────────────────────────────────────────────────────────
function analyticsParams(range: AnalyticsRange, from?: string, to?: string): string {
  const query = new URLSearchParams({ range });
  if (range === 'custom') {
    if (from) query.set('from', from);
    if (to) query.set('to', to);
  }
  return query.toString();
}

export const analyticsApi = {
  overview: (range: AnalyticsRange, from?: string, to?: string) =>
    apiClient.get<ApiSuccess<AnalyticsOverview>>(`/analytics/overview?${analyticsParams(range, from, to)}`),

  engagement: (range: AnalyticsRange, from?: string, to?: string) =>
    apiClient.get<ApiSuccess<AnalyticsEngagement>>(`/analytics/engagement?${analyticsParams(range, from, to)}`),

  knowledge: (range: AnalyticsRange, from?: string, to?: string) =>
    apiClient.get<ApiSuccess<AnalyticsKnowledge>>(`/analytics/knowledge?${analyticsParams(range, from, to)}`),

  topQuestions: (range: AnalyticsRange, from?: string, to?: string) =>
    apiClient.get<ApiSuccess<TopQuestion[]>>(`/analytics/top-questions?${analyticsParams(range, from, to)}`),

  timeseries: (range: AnalyticsRange, from?: string, to?: string) =>
    apiClient.get<ApiSuccess<TimeSeriesPoint[]>>(`/analytics/timeseries?${analyticsParams(range, from, to)}`),

  leads: (range: AnalyticsRange, from?: string, to?: string) =>
    apiClient.get<ApiSuccess<AnalyticsLeadStats>>(`/analytics/leads?${analyticsParams(range, from, to)}`),
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
    duration?: number | 'lifetime';
  }) => apiClient.post<ApiSuccess<AdminOrganization>>('/admin/organizations', payload),

  updateOrganization: (id: string, payload: Partial<{
    name: string;
    slug: string;
    plan: AdminOrganization['plan'];
    isActive: boolean;
    duration: number | 'lifetime';
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
