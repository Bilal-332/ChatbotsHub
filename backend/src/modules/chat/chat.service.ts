import { generateEmbedding } from '@core/ai/embeddingService';
import { searchSimilarChunks } from '@core/vector/qdrantClient';
import { generateChatCompletion, ChatHistoryMessage } from '@core/ai/chatService';
import { classifyQuery } from '@core/ai/queryClassifier';
import { rerankChunks, calculateRetrievalConfidence } from '@core/ai/retrievalRanker';
import { AppError } from '@shared/errors';
import { Document as DocumentModel } from '@modules/documents/document.model';
import { Organization } from '@modules/organizations/organization.model';

const MIN_RELEVANCE_SCORE = 0.28;
const RETRIEVAL_TOP_K = 8;
const RERANK_TOP_N = 5;
const MIN_CONFIDENCE_FOR_RAG = 0.34;
const MAX_MEMORY_TURNS = 8;
const MEMORY_TTL_MS = 1000 * 60 * 60;

const NO_KNOWLEDGE_MESSAGE =
  'I could not find enough relevant information in your uploaded documents to answer that.';

function resolveNoKnowledgeMessage(customMessage?: string): string {
  const trimmed = customMessage?.trim();
  return trimmed ? trimmed : NO_KNOWLEDGE_MESSAGE;
}

async function fetchNoKnowledgeMessage(organizationId: string): Promise<string> {
  const org = await Organization.findById(organizationId)
    .select('settings.noAnswerMessage')
    .lean();

  return resolveNoKnowledgeMessage(org?.settings?.noAnswerMessage);
}

interface ConversationMemory {
  history: ChatHistoryMessage[];
  updatedAt: number;
  state: ConversationState;
}

interface ConversationState {
  currentDay?: string;
  lastDoctorName?: string;
  lastPatientName?: string;
}

interface QuestionContext {
  resolvedQuestion: string;
  shouldAnswerDirectly: boolean;
  directAnswer?: string;
}

function buildGreetingMessage(chatbotName?: string): string {
  const assistantLabel = chatbotName?.trim() || 'AI Assistant';
  return `Hello! I’m ${assistantLabel}. How can I help you today?`;
}

function isDateQuestion(question: string): boolean {
  return /\b(what\s+day\s+is\s+today|what\s+day\s+is\s+it|which\s+day\s+is\s+today|day\s+of\s+the\s+week)\b/i.test(
    question,
  );
}

function getTodayDisplay(): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date());
}

function getTodayName(): string {
  return new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date()).toLowerCase();
}

function extractDayName(text: string): string | undefined {
  const match = text.toLowerCase().match(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/);
  return match?.[1];
}

function extractDoctorName(text: string): string | undefined {
  const patterns = [
    /\b(dr\.\s*[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})\b/,
    /\b(doctor\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})\b/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      return match[1].replace(/\s+/g, ' ').trim();
    }
  }

  return undefined;
}

function extractPatientName(text: string): string | undefined {
  const patterns = [
    /\bhelp me find my patient\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})\b/i,
    /\bpatient(?:\s+name)?\s*[:\-]\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})\b/i,
    /\bname\s*[:\-]\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})\b/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      return match[1].replace(/\s+/g, ' ').trim();
    }
  }

  return undefined;
}

function isAcknowledgementQuestion(question: string): boolean {
  return /^(ok|okay|alright|thanks|thank you|thankyou|cool|great|got it|sounds good)([!.?\s]*)$/i.test(
    question.trim(),
  ) || /\b(thanks|thank you|appreciate it)\b/i.test(question);
}

function isDayCorrection(question: string): boolean {
  return /\b(today\s+is|it's|it\s+is|today's)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i.test(
    question,
  );
}

function applyStateUpdatesFromText(state: ConversationState, text: string): ConversationState {
  const nextState = { ...state };
  const day = extractDayName(text);
  if (day) nextState.currentDay = day;

  const doctorName = extractDoctorName(text);
  if (doctorName) nextState.lastDoctorName = doctorName;

  const patientName = extractPatientName(text);
  if (patientName) nextState.lastPatientName = patientName;

  return nextState;
}

function inferReferenceTarget(question: string): 'doctor' | 'patient' | 'general' {
  const lower = question.toLowerCase();

  if (/\b(doctor|available|availability|schedule|shift|duty)\b/i.test(lower)) {
    return 'doctor';
  }

  if (/\b(patient|find my patient|doctor of|who is the doctor of|patient id)\b/i.test(lower)) {
    return 'patient';
  }

  if (/\b(he|she|him|her|his|hers|they|them|their)\b/i.test(lower)) {
    return 'patient';
  }

  return 'general';
}

function normalizePronouns(
  question: string,
  state: ConversationState,
  target: 'doctor' | 'patient' | 'general',
): string {
  const replacement =
    target === 'doctor'
      ? state.lastDoctorName
      : target === 'patient'
        ? state.lastPatientName
        : undefined;

  if (!replacement) return question;

  return question
    .replace(/\b(he|she|him|her|they|them|his|hers)\b/gi, replacement)
    .replace(/\b(this\s+doctor|that\s+doctor|that\s+one|this\s+one|this\s+patient|that\s+patient)\b/gi, replacement);
}

function contextualizeQuestion(question: string, state: ConversationState): QuestionContext {
  const trimmedQuestion = question.trim();

  if (isAcknowledgementQuestion(trimmedQuestion)) {
    return {
      resolvedQuestion: trimmedQuestion,
      shouldAnswerDirectly: true,
      directAnswer: 'You are welcome. I am here to help.',
    };
  }

  if (isDateQuestion(trimmedQuestion)) {
    const display = getTodayDisplay();
    return {
      resolvedQuestion: trimmedQuestion,
      shouldAnswerDirectly: true,
      directAnswer: `Today is ${display}.`,
    };
  }

  if (isDayCorrection(trimmedQuestion)) {
    const day = extractDayName(trimmedQuestion);
    if (day) {
      return {
        resolvedQuestion: trimmedQuestion,
        shouldAnswerDirectly: true,
        directAnswer: `Understood. I will use ${day.charAt(0).toUpperCase() + day.slice(1)} as today.`,
      };
    }
  }

  let resolvedQuestion = trimmedQuestion;
  const referenceTarget = inferReferenceTarget(resolvedQuestion);

  const effectiveDay = state.currentDay ?? getTodayName();

  if (effectiveDay && /\btoday\b/i.test(resolvedQuestion)) {
    resolvedQuestion = resolvedQuestion.replace(/\btoday\b/gi, effectiveDay);
  }

  resolvedQuestion = normalizePronouns(resolvedQuestion, state, referenceTarget);

  if (/\b(who|which doctor)\s+is\s+available\b/i.test(resolvedQuestion) && effectiveDay) {
    resolvedQuestion = resolvedQuestion.replace(/\btoday\b/gi, effectiveDay);
    if (!/\b(on\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday))\b/i.test(resolvedQuestion)) {
      resolvedQuestion = resolvedQuestion.replace(
        /\b(who|which doctor)\s+is\s+available\b/i,
        `Which doctor is available on ${effectiveDay}`,
      );
    }
  }

  if (/\b(is\s+he|is\s+she|is\s+they)\b/i.test(resolvedQuestion) && state.lastDoctorName) {
    resolvedQuestion = resolvedQuestion.replace(/\b(he|she|they)\b/gi, state.lastDoctorName);
  }

  return {
    resolvedQuestion,
    shouldAnswerDirectly: false,
  };
}

function extractStateFromConversation(history: ChatHistoryMessage[]): ConversationState {
  return history.reduce<ConversationState>((state, message) => applyStateUpdatesFromText(state, message.content), {});
}

function sanitizeAnswer(answer: string): string {
  return answer
    .replace(/^\s*(according to|based on)\s+(the\s+)?(provided\s+)?context[:,\-\s]*/i, '')
    .replace(/^\s*from\s+the\s+provided\s+context[:,\-\s]*/i, '')
    .replace(/^\s*(context|source)\s*[:\-]\s*/i, '')
    .trim();
}

export interface ChatQuery {
  question: string;
  organizationId: string;
  conversationId?: string;
}

export interface ChatResponse {
  answer: string;
  tokensUsed: number;
  sourceChunks: number;
  hasContext: boolean;
}

export class ChatService {
  private readonly memoryStore = new Map<string, ConversationMemory>();

  private buildMemoryKey(organizationId: string, conversationId?: string): string | undefined {
    const sanitizedConversationId = conversationId?.trim();
    if (!sanitizedConversationId) return undefined;
    return `${organizationId}:${sanitizedConversationId}`;
  }

  private pruneMemory(): void {
    const now = Date.now();
    for (const [key, value] of this.memoryStore.entries()) {
      if (now - value.updatedAt > MEMORY_TTL_MS) {
        this.memoryStore.delete(key);
      }
    }
  }

  private getHistory(memoryKey?: string): ChatHistoryMessage[] {
    if (!memoryKey) return [];
    this.pruneMemory();
    return this.memoryStore.get(memoryKey)?.history ?? [];
  }

  private getState(memoryKey?: string): ConversationState {
    if (!memoryKey) return {};
    this.pruneMemory();
    return this.memoryStore.get(memoryKey)?.state ?? {};
  }

  private saveTurn(memoryKey: string | undefined, question: string, answer: string): void {
    if (!memoryKey) return;

    const existing = this.memoryStore.get(memoryKey)?.history ?? [];
    const userTurn: ChatHistoryMessage = { role: 'user', content: question };
    const assistantTurn: ChatHistoryMessage = { role: 'assistant', content: answer };
    const nextHistory = [
      ...existing,
      userTurn,
      assistantTurn,
    ].slice(-MAX_MEMORY_TURNS * 2);

    this.memoryStore.set(memoryKey, {
      history: nextHistory,
      state: extractStateFromConversation(nextHistory),
      updatedAt: Date.now(),
    });
  }

  async query(params: ChatQuery): Promise<ChatResponse> {
    const { question, organizationId, conversationId } = params;

    if (!question?.trim()) {
      throw new AppError('Question cannot be empty', 400, 'INVALID_INPUT');
    }

    const memoryKey = this.buildMemoryKey(organizationId, conversationId);
    const currentHistory = this.getHistory(memoryKey);
    const currentState = this.getState(memoryKey);
    const mergedState = extractStateFromConversation(currentHistory);
    const state = { ...currentState, ...mergedState };
    const questionContext = contextualizeQuestion(question, state);

    if (questionContext.shouldAnswerDirectly) {
      const directAnswer = questionContext.directAnswer
        ?? (await fetchNoKnowledgeMessage(organizationId));
      this.saveTurn(memoryKey, question, directAnswer);

      return {
        answer: directAnswer,
        tokensUsed: 0,
        sourceChunks: 0,
        hasContext: false,
      };
    }

    const queryType = classifyQuery(question);

    if (queryType === 'greeting') {
      const organization = await Organization.findById(organizationId)
        .select('settings.chatbotName')
        .lean();

      return {
        answer: buildGreetingMessage(organization?.settings?.chatbotName),
        tokensUsed: 0,
        sourceChunks: 0,
        hasContext: false,
      };
    }

    const readyDocumentCount = await DocumentModel.countDocuments({
      organizationId,
      status: 'ready',
    });

    if (readyDocumentCount === 0) {
      return {
        answer: 'No documents are ready in this workspace yet. Upload and process documents first.',
        tokensUsed: 0,
        sourceChunks: 0,
        hasContext: false,
      };
    }

    // 1. Embed the user's question
    const questionVector = await generateEmbedding(questionContext.resolvedQuestion);

    // 2. Retrieve relevant chunks from Qdrant
    const chunks = await searchSimilarChunks(questionVector, organizationId, RETRIEVAL_TOP_K);

    // 3. Filter by relevance score threshold
    const relevantChunks = chunks.filter((c) => c.score >= MIN_RELEVANCE_SCORE);

    if (relevantChunks.length === 0) {
      const fallbackMessage = await fetchNoKnowledgeMessage(organizationId);
      return {
        answer: fallbackMessage,
        tokensUsed: 0,
        sourceChunks: 0,
        hasContext: false,
      };
    }

    // 4. Re-rank chunks with lexical + semantic signal.
    const rankedChunks = rerankChunks(questionContext.resolvedQuestion, relevantChunks, RERANK_TOP_N);
    const confidence = calculateRetrievalConfidence(rankedChunks);

    // 5. If confidence is low, stay within organization scope and avoid generic fallback.
    if (confidence < MIN_CONFIDENCE_FOR_RAG) {
      const fallbackMessage = await fetchNoKnowledgeMessage(organizationId);
      return {
        answer: fallbackMessage,
        tokensUsed: 0,
        sourceChunks: 0,
        hasContext: false,
      };
    }

    // 6. Generate completion using the best retrieved context.
    const history = [...currentHistory, { role: 'user', content: question } as ChatHistoryMessage];
    const { answer, tokensUsed } = await generateChatCompletion(questionContext.resolvedQuestion, {
      mode: 'knowledge',
      history,
      contextChunks: rankedChunks.map((chunk) => ({
        text: chunk.text,
        documentTitle: chunk.documentTitle,
        section: chunk.section,
        pageNumber: chunk.pageNumber,
      })),
    });

    const finalAnswer = sanitizeAnswer(answer);
    this.saveTurn(memoryKey, question, finalAnswer);

    return {
      answer: finalAnswer,
      tokensUsed,
      sourceChunks: rankedChunks.length,
      hasContext: true,
    };
  }
}

export const chatService = new ChatService();
