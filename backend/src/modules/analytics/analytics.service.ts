import { Types } from 'mongoose';
import { AnalyticsEvent } from './analyticsEvent.model';
import { Lead } from '@modules/leads/lead.model';
import { logger } from '@shared/logger';

export type AnalyticsRange = 'today' | '7d' | '30d' | '90d' | 'custom';

export interface DateRange {
  start: Date;
  end: Date;
}

export interface RecordEventParams {
  organizationId: string;
  conversationId?: string;
  visitorId?: string;
  question: string;
  answered: boolean;
  confidence?: number;
  sourceChunks: number;
}

export interface OverviewMetrics {
  totalConversations: number;
  uniqueVisitors: number;
  totalMessages: number;
  leadsGenerated: number;
}

export interface EngagementMetrics {
  avgMessagesPerSession: number;
  avgSessionDurationSeconds: number;
  bounceRate: number;
}

export interface KnowledgeMetrics {
  answeredQueries: number;
  unansweredQueries: number;
  answerRate: number;
  avgConfidence: number;
}

export interface TopQuestion {
  question: string;
  count: number;
}

export interface TimeSeriesPoint {
  date: string;
  conversations: number;
  messages: number;
  leads: number;
  answered: number;
  unanswered: number;
}

export interface LeadStats {
  leadsPerDay: { date: string; leads: number }[];
  conversionRate: number;
  totalLeads: number;
}

const CACHE_TTL_MS = 60_000;

interface CacheEntry {
  value: unknown;
  expiresAt: number;
}

function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function normalizeQuestion(question: string): string {
  return question
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 200);
}

export class AnalyticsService {
  private cache = new Map<string, CacheEntry>();

  /**
   * Persist a single chat interaction for analytics. Safe to call
   * fire-and-forget: failures are logged and never bubble to the chat flow.
   */
  async record(params: RecordEventParams): Promise<void> {
    const question = params.question.replace(/[\x00-\x1F\x7F]/g, ' ').slice(0, 500).trim();

    await AnalyticsEvent.create({
      organizationId: params.organizationId,
      conversationId: params.conversationId?.trim() || 'anonymous',
      visitorId: params.visitorId?.trim() || undefined,
      type: 'message',
      question: question || undefined,
      questionNormalized: question ? normalizeQuestion(question) : undefined,
      answered: params.answered,
      confidence: typeof params.confidence === 'number' ? params.confidence : undefined,
      sourceChunks: params.sourceChunks,
    });
  }

  resolveRange(range: AnalyticsRange, from?: string, to?: string): DateRange {
    const end = new Date();
    let start: Date;

    switch (range) {
      case 'today': {
        start = new Date();
        start.setHours(0, 0, 0, 0);
        break;
      }
      case '7d':
        start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        start = new Date(end.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'custom': {
        const parsedStart = from ? new Date(from) : null;
        const parsedEnd = to ? new Date(to) : null;
        start =
          parsedStart && !Number.isNaN(parsedStart.getTime())
            ? parsedStart
            : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
        if (parsedEnd && !Number.isNaN(parsedEnd.getTime())) {
          return { start, end: parsedEnd };
        }
        break;
      }
      case '30d':
      default:
        start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }

    return { start, end };
  }

  private async cached<T>(key: string, loader: () => Promise<T>): Promise<T> {
    const hit = this.cache.get(key);
    if (hit && hit.expiresAt > Date.now()) {
      return hit.value as T;
    }
    const value = await loader();
    this.cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
    return value;
  }

  private cacheKey(metric: string, organizationId: string, range: DateRange): string {
    return `${metric}:${organizationId}:${range.start.getTime()}:${range.end.getTime()}`;
  }

  private match(organizationId: string, range: DateRange) {
    return {
      organizationId: new Types.ObjectId(organizationId),
      createdAt: { $gte: range.start, $lte: range.end },
    };
  }

  async getOverview(organizationId: string, range: DateRange): Promise<OverviewMetrics> {
    return this.cached(this.cacheKey('overview', organizationId, range), async () => {
      const match = this.match(organizationId, range);

      const [agg] = await AnalyticsEvent.aggregate<{
        totalMessages: number;
        conversations: string[];
        visitors: string[];
      }>([
        { $match: match },
        {
          $group: {
            _id: null,
            totalMessages: { $sum: 1 },
            conversations: { $addToSet: '$conversationId' },
            visitors: { $addToSet: '$visitorId' },
          },
        },
      ]);

      const leadsGenerated = await Lead.countDocuments({
        organizationId,
        createdAt: { $gte: range.start, $lte: range.end },
      });

      const visitors = (agg?.visitors ?? []).filter((v) => Boolean(v));

      return {
        totalConversations: agg?.conversations.length ?? 0,
        uniqueVisitors: visitors.length,
        totalMessages: agg?.totalMessages ?? 0,
        leadsGenerated,
      };
    });
  }

  async getEngagement(organizationId: string, range: DateRange): Promise<EngagementMetrics> {
    return this.cached(this.cacheKey('engagement', organizationId, range), async () => {
      const match = this.match(organizationId, range);

      const [agg] = await AnalyticsEvent.aggregate<{
        totalConversations: number;
        totalMessages: number;
        bouncedConversations: number;
        avgSessionDurationSeconds: number;
      }>([
        { $match: match },
        {
          $group: {
            _id: '$conversationId',
            messageCount: { $sum: 1 },
            firstAt: { $min: '$createdAt' },
            lastAt: { $max: '$createdAt' },
          },
        },
        {
          $group: {
            _id: null,
            totalConversations: { $sum: 1 },
            totalMessages: { $sum: '$messageCount' },
            bouncedConversations: {
              $sum: { $cond: [{ $eq: ['$messageCount', 1] }, 1, 0] },
            },
            avgSessionDurationSeconds: {
              $avg: { $divide: [{ $subtract: ['$lastAt', '$firstAt'] }, 1000] },
            },
          },
        },
      ]);

      const totalConversations = agg?.totalConversations ?? 0;
      const totalMessages = agg?.totalMessages ?? 0;

      return {
        avgMessagesPerSession:
          totalConversations > 0 ? round(totalMessages / totalConversations) : 0,
        avgSessionDurationSeconds: round(agg?.avgSessionDurationSeconds ?? 0),
        bounceRate:
          totalConversations > 0
            ? round((agg?.bouncedConversations ?? 0) / totalConversations)
            : 0,
      };
    });
  }

  async getKnowledge(organizationId: string, range: DateRange): Promise<KnowledgeMetrics> {
    return this.cached(this.cacheKey('knowledge', organizationId, range), async () => {
      const match = this.match(organizationId, range);

      const [agg] = await AnalyticsEvent.aggregate<{
        answeredQueries: number;
        unansweredQueries: number;
        avgConfidence: number;
      }>([
        { $match: match },
        {
          $group: {
            _id: null,
            answeredQueries: { $sum: { $cond: ['$answered', 1, 0] } },
            unansweredQueries: { $sum: { $cond: ['$answered', 0, 1] } },
            avgConfidence: { $avg: '$confidence' },
          },
        },
      ]);

      const answeredQueries = agg?.answeredQueries ?? 0;
      const unansweredQueries = agg?.unansweredQueries ?? 0;
      const total = answeredQueries + unansweredQueries;

      return {
        answeredQueries,
        unansweredQueries,
        answerRate: total > 0 ? round(answeredQueries / total) : 0,
        avgConfidence: round(agg?.avgConfidence ?? 0),
      };
    });
  }

  async getTopQuestions(
    organizationId: string,
    range: DateRange,
    limit = 10,
  ): Promise<TopQuestion[]> {
    return this.cached(this.cacheKey(`top:${limit}`, organizationId, range), async () => {
      const match = this.match(organizationId, range);

      const results = await AnalyticsEvent.aggregate<{ _id: string; count: number; question: string }>([
        { $match: { ...match, questionNormalized: { $exists: true, $ne: '' } } },
        {
          $group: {
            _id: '$questionNormalized',
            count: { $sum: 1 },
            question: { $first: '$question' },
          },
        },
        { $sort: { count: -1 } },
        { $limit: limit },
      ]);

      return results.map((r) => ({
        question: r.question || r._id,
        count: r.count,
      }));
    });
  }

  async getTimeSeries(organizationId: string, range: DateRange): Promise<TimeSeriesPoint[]> {
    return this.cached(this.cacheKey('timeseries', organizationId, range), async () => {
      const match = this.match(organizationId, range);

      const messageSeries = await AnalyticsEvent.aggregate<{
        _id: string;
        messages: number;
        answered: number;
        unanswered: number;
        conversations: string[];
      }>([
        { $match: match },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            messages: { $sum: 1 },
            answered: { $sum: { $cond: ['$answered', 1, 0] } },
            unanswered: { $sum: { $cond: ['$answered', 0, 1] } },
            conversations: { $addToSet: '$conversationId' },
          },
        },
      ]);

      const leadSeries = await Lead.aggregate<{ _id: string; leads: number }>([
        {
          $match: {
            organizationId: new Types.ObjectId(organizationId),
            createdAt: { $gte: range.start, $lte: range.end },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            leads: { $sum: 1 },
          },
        },
      ]);

      const map = new Map<string, TimeSeriesPoint>();

      for (const point of messageSeries) {
        map.set(point._id, {
          date: point._id,
          messages: point.messages,
          answered: point.answered,
          unanswered: point.unanswered,
          conversations: point.conversations.length,
          leads: 0,
        });
      }

      for (const point of leadSeries) {
        const existing = map.get(point._id);
        if (existing) {
          existing.leads = point.leads;
        } else {
          map.set(point._id, {
            date: point._id,
            messages: 0,
            answered: 0,
            unanswered: 0,
            conversations: 0,
            leads: point.leads,
          });
        }
      }

      return [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
    });
  }

  async getLeadStats(organizationId: string, range: DateRange): Promise<LeadStats> {
    return this.cached(this.cacheKey('leadstats', organizationId, range), async () => {
      const leadsPerDayRaw = await Lead.aggregate<{ _id: string; leads: number }>([
        {
          $match: {
            organizationId: new Types.ObjectId(organizationId),
            createdAt: { $gte: range.start, $lte: range.end },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            leads: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      const totalLeads = leadsPerDayRaw.reduce((sum, point) => sum + point.leads, 0);

      // Conversion rate = leads / unique conversations in the same window.
      const [convAgg] = await AnalyticsEvent.aggregate<{ conversations: string[] }>([
        { $match: this.match(organizationId, range) },
        { $group: { _id: null, conversations: { $addToSet: '$conversationId' } } },
      ]);

      const totalConversations = convAgg?.conversations.length ?? 0;

      return {
        leadsPerDay: leadsPerDayRaw.map((p) => ({ date: p._id, leads: p.leads })),
        totalLeads,
        conversionRate: totalConversations > 0 ? round(totalLeads / totalConversations) : 0,
      };
    });
  }
}

export const analyticsService = new AnalyticsService();

/**
 * Fire-and-forget analytics recording used by the chat flow. Never throws.
 */
export function recordChatAnalytics(params: RecordEventParams): void {
  analyticsService.record(params).catch((error: unknown) => {
    logger.error('Failed to record chat analytics:', error);
  });
}
