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
    maxMonthlyQueries: 200,
    maxFileSizeMb: 5,
    maxCrawlPages: 10,
  },
  starter: {
    maxDocuments: 20,
    maxMonthlyQueries: 2000,
    maxFileSizeMb: 10,
    maxCrawlPages: 100,
  },
  pro: {
    maxDocuments: 100,
    maxMonthlyQueries: 20000,
    maxFileSizeMb: 25,
    maxCrawlPages: 1000,
  },
};

export const PLAN_NAMES: PlanName[] = ['free', 'starter', 'pro'];
