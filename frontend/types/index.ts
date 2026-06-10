// ─── API Response Envelope ───────────────────────────────────────────────────
export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Domain Types ────────────────────────────────────────────────────────────
export type UserRole = 'admin' | 'member' | 'super_admin';
export type PlanName = 'free' | 'starter' | 'pro';
export type DocumentStatus = 'pending' | 'processing' | 'ready' | 'failed';
export type DocumentSourceType = 'pdf' | 'docx' | 'txt';
export type SupportedLanguage = 'auto' | 'en' | 'ar' | 'ur';

export interface PlanExpiryWarning {
  expiredPlan: PlanName;
  expiredAt: string;
  message: string;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  organizationId: string;
}

export interface AdminOrganization {
  _id: string;
  name: string;
  slug: string;
  plan: PlanName;
  isActive: boolean;
  apiKey: string;
  monthlyQueryCount: number;
  queryResetAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser {
  _id: string;
  email: string;
  role: UserRole;
  organizationId: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  organization?: {
    _id: string;
    name: string;
    slug: string;
    plan: PlanName;
    isActive: boolean;
  } | null;
}

export interface Organization {
  _id: string;
  name: string;
  slug: string;
  apiKey: string;
  plan: PlanName;
  planExpiresAt?: string | null;
  planExpiredAt?: string | null;
  expiredPlan?: 'starter' | 'pro' | null;
  isActive: boolean;
  monthlyQueryCount: number;
  queryResetAt: string;
  planExpiryWarning?: PlanExpiryWarning | null;
  settings: {
    chatbotName: string;
    welcomeMessage: string;
    noAnswerMessage: string;
    primaryColor: string;
    avatarUrl?: string;
    language: SupportedLanguage;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  _id: string;
  organizationId: string;
  title: string;
  fileUrl: string;
  sourceType: DocumentSourceType;
  status: DocumentStatus;
  chunkCount: number;
  processingError?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrgStats {
  plan: PlanName;
  monthlyQueryCount: number;
  queryResetAt: string;
  planExpiryWarning?: PlanExpiryWarning | null;
  limits: {
    maxDocuments: number;
    maxMonthlyQueries: number;
    maxFileSizeMb: number;
  };
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult {
  tokens: TokenPair;
  user: User;
  planExpiryWarning?: PlanExpiryWarning | null;
}

export interface ChatQueryResult {
  answer: string;
  tokensUsed: number;
  sourceChunks: number;
  hasContext: boolean;
}
