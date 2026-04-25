export type QueryType = 'greeting' | 'general' | 'knowledge';

const GREETING_PATTERNS: RegExp[] = [
  /^(hi|hello|hey|yo|hola|good\s+(morning|afternoon|evening))\b[!.?\s]*$/i,
  /^(how are you|what's up|sup)\b[!.?\s]*$/i,
];

const KNOWLEDGE_HINTS = [
  'according to',
  'from the document',
  'in the document',
  'knowledge base',
  'uploaded file',
  'our policy',
  'company policy',
  'handbook',
  'contract',
  'invoice',
  'organization',
  'internal',
  'what does',
  'where does it say',
  'section',
  'page',
];

export function classifyQuery(rawQuestion: string): QueryType {
  const question = rawQuestion.trim();
  const lower = question.toLowerCase();

  if (!question) {
    return 'general';
  }

  if (GREETING_PATTERNS.some((pattern) => pattern.test(question))) {
    return 'greeting';
  }

  const hintMatches = KNOWLEDGE_HINTS.filter((hint) => lower.includes(hint)).length;

  // Questions that explicitly reference private/business docs should use RAG.
  if (hintMatches >= 1) {
    return 'knowledge';
  }

  // Generic social / utility prompts should stay on direct LLM route.
  return 'general';
}
