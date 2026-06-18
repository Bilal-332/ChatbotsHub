export type QueryType = 'greeting' | 'general' | 'knowledge';

const GREETING_PATTERNS: RegExp[] = [
  /^(hi|hello|hey|yo|hola|good\s+(morning|afternoon|evening))\b[!.?\s]*$/i,
  /^(how are you|what's up|sup)\b[!.?\s]*$/i,
];

/**
 * High-precision conversational / small-talk prompts that are clearly NOT
 * about the organization's documents. These are anchored to the whole message
 * (`$`) so partial matches like "what can you do about my refund?" still fall
 * through to knowledge (RAG) retrieval.
 */
const GENERAL_PATTERNS: RegExp[] = [
  /^(who|what)\s+are\s+you\b[?!.\s]*$/i,
  /^what'?s\s+your\s+name\b[?!.\s]*$/i,
  /^what\s+can\s+you\s+do\b[?!.\s]*$/i,
  /^how\s+do\s+you\s+work\b[?!.\s]*$/i,
  /^are\s+you\s+(a\s+)?(bot|robot|human|ai|real)\b[?!.\s]*$/i,
  /\b(tell|say|share)\s+(me\s+)?(a\s+)?(joke|fun\s*fact)\b/i,
];

export function classifyQuery(rawQuestion: string): QueryType {
  const question = rawQuestion.trim();

  if (!question) {
    return 'general';
  }

  if (GREETING_PATTERNS.some((pattern) => pattern.test(question))) {
    return 'greeting';
  }

  // Clearly conversational / small-talk prompts go to the direct LLM route.
  if (GENERAL_PATTERNS.some((pattern) => pattern.test(question))) {
    return 'general';
  }

  // Everything else defaults to knowledge (RAG). Document QA is the primary
  // purpose, so ambiguous questions should consult the uploaded documents
  // rather than being answered from the model's general knowledge.
  return 'knowledge';
}
