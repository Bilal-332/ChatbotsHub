import { Request } from 'express';

export type UserRole = 'admin' | 'member' | 'super_admin';
export type DocumentSourceType = 'pdf' | 'docx' | 'txt';
export type DocumentStatus = 'pending' | 'processing' | 'ready' | 'failed';
export type PlanName = 'free' | 'starter' | 'pro';

export interface JwtPayload {
  userId: string;
  organizationId: string;
  role: UserRole;
}

export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

export interface ApiKeyRequest extends Request {
  organizationId: string;
}

export interface ChunkMetadata {
  organizationId: string;
  documentId: string;
  documentTitle: string;
  chunkIndex: number;
  section?: string;
  pageNumber?: number;
  text: string;
}

export interface ScoredChunk {
  text: string;
  score: number;
  rerankScore?: number;
  documentId: string;
  documentTitle?: string;
  chunkIndex: number;
  section?: string;
  pageNumber?: number;
}

export interface EmbeddingVector {
  vector: number[];
  metadata: ChunkMetadata;
}
