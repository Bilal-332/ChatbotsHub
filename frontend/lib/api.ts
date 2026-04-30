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
