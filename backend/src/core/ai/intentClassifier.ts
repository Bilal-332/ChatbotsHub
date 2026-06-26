import axios from 'axios';
import { config } from '@shared/config';
import { logger } from '@shared/logger';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export type LeadIntent = 'pricing' | 'contact' | 'support' | 'other';

export interface IntentResult {
  intent: LeadIntent;
  /** True when the message signals buying/contact interest worth capturing as a lead. */
  shouldCaptureLead: boolean;
  /** Heuristic-only confidence in [0, 1]. */
  confidence: number;
}

interface GroqChoice {
  message: { role: string; content: string };
}

interface GroqResponse {
  choices: GroqChoice[];
}

// High-precision keyword fast-path. Used both as a cheap pre-filter and as a
// resilient fallback if the LLM call fails or is rate-limited.
const PRICING_PATTERNS: RegExp[] = [
  /\b(price|pricing|cost|costs|charge|charges|fee|fees|quote|quotation|how much|budget|plan|subscription|pay|payment|afford|discount)\b/i,
];

const CONTACT_PATTERNS: RegExp[] = [
  /\b(call me|contact me|reach me|get in touch|talk to (a|someone|sales)|speak (to|with)|book (a )?(call|demo|meeting)|schedule (a )?(call|demo|meeting)|sales team|your team|representative|human|agent|email me|phone)\b/i,
];

function keywordIntent(message: string): IntentResult {
  if (CONTACT_PATTERNS.some((pattern) => pattern.test(message))) {
    return { intent: 'contact', shouldCaptureLead: true, confidence: 0.7 };
  }
  if (PRICING_PATTERNS.some((pattern) => pattern.test(message))) {
    return { intent: 'pricing', shouldCaptureLead: true, confidence: 0.7 };
  }
  return { intent: 'other', shouldCaptureLead: false, confidence: 0.5 };
}

function normalizeIntent(value: unknown): LeadIntent {
  if (value === 'pricing' || value === 'contact' || value === 'support') {
    return value;
  }
  return 'other';
}

/**
 * Classify the buyer intent of a visitor message. Uses Groq for nuanced
 * understanding, with a deterministic keyword fallback so the widget never
 * breaks if the AI service is unavailable.
 */
export async function classifyLeadIntent(rawMessage: string): Promise<IntentResult> {
  const message = rawMessage.replace(/[\x00-\x1F\x7F]/g, ' ').slice(0, 500).trim();

  if (!message) {
    return { intent: 'other', shouldCaptureLead: false, confidence: 0 };
  }

  const heuristic = keywordIntent(message);

  try {
    const response = await axios.post<GroqResponse>(
      GROQ_API_URL,
      {
        model: config.groq.model,
        messages: [
          {
            role: 'system',
            content: `You are an intent classifier for a sales chatbot. Classify the user's message into exactly one intent and decide if it indicates a sales lead.

Intents:
- "pricing": asking about price, cost, plans, quotes, budget, or payment.
- "contact": wants to talk to a human, sales, schedule a call/demo, or be contacted.
- "support": needs help with an existing product/issue (not a new sales opportunity).
- "other": general question, greeting, or anything else.

Respond with ONLY a compact JSON object, no prose:
{"intent":"pricing|contact|support|other","shouldCaptureLead":true|false}

Set shouldCaptureLead to true only for "pricing" or "contact".`,
          },
          { role: 'user', content: message },
        ],
        max_tokens: 40,
        temperature: 0,
        response_format: { type: 'json_object' },
      },
      {
        headers: {
          Authorization: `Bearer ${config.groq.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 8000,
      },
    );

    const content = response.data.choices[0]?.message.content?.trim();
    if (!content) {
      return heuristic;
    }

    const parsed = JSON.parse(content) as { intent?: unknown; shouldCaptureLead?: unknown };
    const intent = normalizeIntent(parsed.intent);
    const shouldCaptureLead =
      parsed.shouldCaptureLead === true && (intent === 'pricing' || intent === 'contact');

    return { intent, shouldCaptureLead, confidence: 0.9 };
  } catch (error) {
    logger.warn(
      `Lead intent classification fell back to keywords: ${
        error instanceof Error ? error.message : 'unknown error'
      }`,
    );
    return heuristic;
  }
}
