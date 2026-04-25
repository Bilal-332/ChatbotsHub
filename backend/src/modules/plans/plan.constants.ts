import type { PlanName } from '@shared/types';

export interface PlanLimits {
  maxDocuments: number;
  maxMonthlyQueries: number;
  maxFileSizeMb: number;
}

export const PLAN_LIMITS: Record<PlanName, PlanLimits> = {
  free: {
    maxDocuments: 3,
    maxMonthlyQueries: 200,
    maxFileSizeMb: 5,
  },
  starter: {
    maxDocuments: 20,
    maxMonthlyQueries: 2000,
    maxFileSizeMb: 10,
  },
  pro: {
    maxDocuments: 100,
    maxMonthlyQueries: 20000,
    maxFileSizeMb: 25,
  },
};

export const PLAN_NAMES: PlanName[] = ['free', 'starter', 'pro'];
