import type { PlanName } from '@shared/types';

export interface PlanLimits {
  maxDocuments: number;
  maxMonthlyQueries: number;
  maxFileSizeMb: number;
  /** Maximum pages crawled when training the chatbot from a website URL. */
  maxCrawlPages: number;
}

export const PLAN_LIMITS: Record<PlanName, PlanLimits> = {
  free: {
    maxDocuments: 3,
    maxMonthlyQueries: 100,
    maxFileSizeMb: 5,
    maxCrawlPages: 10,
  },
  starter: {
    maxDocuments: 10,
    maxMonthlyQueries: 1000,
    maxFileSizeMb: 10,
    maxCrawlPages: 100,
  },
  pro: {
    maxDocuments: 20,
    maxMonthlyQueries: 10000,
    maxFileSizeMb: 15,
    maxCrawlPages: 1000,
  },
};

export const PLAN_NAMES: PlanName[] = ['free', 'starter', 'pro'];
