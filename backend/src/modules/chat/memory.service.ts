import {
  ConversationSession,
  type ConversationState,
  type ConversationMessage,
} from './conversation.model';
import type { ChatHistoryMessage } from '@core/ai/chatService';

const MAX_MEMORY_TURNS = 8;
const SESSION_TTL_MS = 1000 * 60 * 60; // 1 hour

/** In-memory cache to reduce DB reads on active conversations */
const cache = new Map<
  string,
  { history: ChatHistoryMessage[]; state: ConversationState; updatedAt: number }
>();

function buildKey(organizationId: string, conversationId: string): string {
  return `${organizationId}:${conversationId}`;
}

function pruneCache(): void {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.updatedAt > SESSION_TTL_MS) {
      cache.delete(key);
    }
  }
}

export class MemoryService {
  async getHistory(
    organizationId: string,
    conversationId?: string,
  ): Promise<ChatHistoryMessage[]> {
    if (!conversationId?.trim()) return [];

    const key = buildKey(organizationId, conversationId);
    pruneCache();

    const cached = cache.get(key);
    if (cached) return cached.history;

    const session = await ConversationSession.findOne({
      organizationId,
      conversationId,
      expiresAt: { $gt: new Date() },
    })
      .select('history state')
      .lean();

    if (!session) return [];

    cache.set(key, {
      history: session.history,
      state: session.state ?? {},
      updatedAt: Date.now(),
    });

    return session.history;
  }

  async getState(
    organizationId: string,
    conversationId?: string,
  ): Promise<ConversationState> {
    if (!conversationId?.trim()) return {};

    const key = buildKey(organizationId, conversationId);
    pruneCache();

    const cached = cache.get(key);
    if (cached) return cached.state;

    const session = await ConversationSession.findOne({
      organizationId,
      conversationId,
      expiresAt: { $gt: new Date() },
    })
      .select('state history')
      .lean();

    if (!session) return {};

    cache.set(key, {
      history: session.history ?? [],
      state: session.state ?? {},
      updatedAt: Date.now(),
    });

    return session.state ?? {};
  }

  async saveTurn(
    organizationId: string,
    conversationId: string | undefined,
    question: string,
    answer: string,
    stateUpdate?: Partial<ConversationState>,
  ): Promise<void> {
    if (!conversationId?.trim()) return;

    const key = buildKey(organizationId, conversationId);
    const existing = cache.get(key);
    const priorHistory = existing?.history ?? (await this.getHistory(organizationId, conversationId));
    const priorState = existing?.state ?? (await this.getState(organizationId, conversationId));

    const userTurn: ConversationMessage = { role: 'user', content: question };
    const assistantTurn: ConversationMessage = { role: 'assistant', content: answer };
    const nextHistory = [...priorHistory, userTurn, assistantTurn].slice(-MAX_MEMORY_TURNS * 2);
    const nextState = { ...priorState, ...stateUpdate };
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

    cache.set(key, { history: nextHistory, state: nextState, updatedAt: Date.now() });

    await ConversationSession.findOneAndUpdate(
      { organizationId, conversationId },
      {
        $set: {
          history: nextHistory,
          state: nextState,
          expiresAt,
        },
      },
      { upsert: true, new: true },
    );
  }
}

export const memoryService = new MemoryService();
