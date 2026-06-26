import { generateQueryEmbedding } from '@core/ai/embeddingService';
import { searchSimilarChunks } from '@core/vector/qdrantClient';
import { generateChatCompletion, ChatHistoryMessage } from '@core/ai/chatService';
import { classifyQuery } from '@core/ai/queryClassifier';
import { rerankChunks, calculateRetrievalConfidence } from '@core/ai/retrievalRanker';
import {
  resolveResponseLanguage,
  translateText,
  type SupportedLanguage,
} from '@core/ai/languageService';
import { memoryService } from './memory.service';
import type { ConversationState } from './conversation.model';
import { AppError } from '@shared/errors';
import { Document as DocumentModel } from '@modules/documents/document.model';
import { Organization } from '@modules/organizations/organization.model';

const MIN_RELEVANCE_SCORE = 0.2;
const MIN_RERANK_SCORE = 0.35;
const RETRIEVAL_TOP_K = 8;
const RERANK_TOP_N = 5;
const MIN_CONFIDENCE_FOR_RAG = 0.28;

const NO_KNOWLEDGE_MESSAGE =
  'That\'s a great question. I don\'t know the answer yet, but if you tell me more, I\'ll do my best to help.';

function resolveNoKnowledgeMessage(customMessage?: string): string {
  const trimmed = customMessage?.trim();
  return trimmed ? trimmed : NO_KNOWLEDGE_MESSAGE;
}

interface QuestionContext {
  resolvedQuestion: string;
  shouldAnswerDirectly: boolean;
  directAnswer?: string;
}

interface OrgChatSettings {
  chatbotName?: string;
  noAnswerMessage?: string;
  language: SupportedLanguage;
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
  /** Whether the assistant could meaningfully respond (false = no-answer fallback). For analytics. */
  answered?: boolean;
  /** Retrieval confidence for knowledge-mode answers, in [0, 1]. For analytics. */
  confidence?: number;
}

export class ChatService {
  private async getOrgSettings(organizationId: string): Promise<OrgChatSettings> {
    const org = await Organization.findById(organizationId)
      .select('settings.chatbotName settings.noAnswerMessage settings.language')
      .lean();

    return {
      chatbotName: org?.settings?.chatbotName,
      noAnswerMessage: org?.settings?.noAnswerMessage,
      language: (org?.settings?.language as SupportedLanguage) ?? 'auto',
    };
  }

  async query(params: ChatQuery): Promise<ChatResponse> {
    const { question, organizationId, conversationId } = params;

    if (!question?.trim()) {
      throw new AppError('Question cannot be empty', 400, 'INVALID_INPUT');
    }

    const orgSettings = await this.getOrgSettings(organizationId);
    const languageContext = resolveResponseLanguage(question, orgSettings.language);

    const currentHistory = await memoryService.getHistory(organizationId, conversationId);
    const currentState = await memoryService.getState(organizationId, conversationId);
    const mergedState = extractStateFromConversation(currentHistory);
    const state: ConversationState = { ...currentState, ...mergedState };

    const questionContext = contextualizeQuestion(question, state);

    if (questionContext.shouldAnswerDirectly) {
      let directAnswer = questionContext.directAnswer
        ?? resolveNoKnowledgeMessage(orgSettings.noAnswerMessage);

      if (languageContext.responseLanguage !== 'en') {
        directAnswer = await translateText(
          directAnswer,
          languageContext.responseLanguage,
          'en',
        );
      }

      await memoryService.saveTurn(
        organizationId,
        conversationId,
        question,
        directAnswer,
        { preferredLanguage: languageContext.responseLanguage },
      );

      return {
        answer: directAnswer,
        tokensUsed: 0,
        sourceChunks: 0,
        hasContext: false,
        answered: true,
      };
    }

    const queryType = classifyQuery(question);

    if (queryType === 'greeting') {
      let answer = buildGreetingMessage(orgSettings.chatbotName);

      if (languageContext.responseLanguage !== 'en') {
        answer = await translateText(answer, languageContext.responseLanguage, 'en');
      }

      await memoryService.saveTurn(
        organizationId,
        conversationId,
        question,
        answer,
        { preferredLanguage: languageContext.responseLanguage },
      );

      return {
        answer,
        tokensUsed: 0,
        sourceChunks: 0,
        hasContext: false,
        answered: true,
      };
    }

    // Clearly conversational / small-talk prompts are answered directly by the
    // LLM (general mode) instead of being forced through document retrieval,
    // which would otherwise return the "no relevant information" fallback.
    if (queryType === 'general') {
      const { answer: generalAnswer, tokensUsed } = await generateChatCompletion(
        questionContext.resolvedQuestion,
        {
          mode: 'general',
          history: currentHistory,
          responseLanguage: languageContext.responseLanguage,
        },
      );

      const finalAnswer = sanitizeAnswer(generalAnswer);

      await memoryService.saveTurn(
        organizationId,
        conversationId,
        question,
        finalAnswer,
        { preferredLanguage: languageContext.responseLanguage },
      );

      return {
        answer: finalAnswer,
        tokensUsed,
        sourceChunks: 0,
        hasContext: false,
        answered: true,
      };
    }

    const readyDocumentCount = await DocumentModel.countDocuments({
      organizationId,
      status: 'ready',
    });

    if (readyDocumentCount === 0) {
      let answer = 'No documents are ready in this workspace yet. Upload and process documents first.';
      if (languageContext.responseLanguage !== 'en') {
        answer = await translateText(answer, languageContext.responseLanguage, 'en');
      }
      return {
        answer,
        tokensUsed: 0,
        sourceChunks: 0,
        hasContext: false,
        answered: false,
      };
    }

    // Translate question to English for embedding + retrieval when needed
    let resolvedQuestion = questionContext.resolvedQuestion;
    if (languageContext.detected !== 'en') {
      resolvedQuestion = await translateText(
        questionContext.resolvedQuestion,
        'en',
        languageContext.detected,
      );
    }

    // Include recent conversation history in the retrieval query so follow-ups
    // with pronouns/vague phrasing ("his projects", "tell me more about him")
    // embed against the right meaning. Only the embedding query is augmented;
    // rerank and generation still use the standalone resolvedQuestion.
    const recentContext = currentHistory
      .slice(-4)
      .map((message) => message.content)
      .join(' ')
      .slice(0, 600);
    const retrievalQuery = recentContext
      ? `${recentContext}\n${resolvedQuestion}`
      : resolvedQuestion;

    const questionVector = await generateQueryEmbedding(retrievalQuery);
    const candidates = await searchSimilarChunks(questionVector, organizationId, RETRIEVAL_TOP_K);

    // Re-rank the full candidate set BEFORE filtering, so an exact keyword/name
    // match (strong lexical overlap) can rescue a chunk whose dense-only score
    // is modest. Filtering on raw semantic score first would discard it.
    const rankedChunks = rerankChunks(resolvedQuestion, candidates, RERANK_TOP_N);

    // Keep a chunk if it clears a low semantic bar OR has strong blended overlap.
    const relevantChunks = rankedChunks.filter(
      (c) => c.score >= MIN_RELEVANCE_SCORE || (c.rerankScore ?? 0) >= MIN_RERANK_SCORE,
    );

    if (relevantChunks.length === 0) {
      let fallbackMessage = resolveNoKnowledgeMessage(orgSettings.noAnswerMessage);
      if (languageContext.responseLanguage !== 'en') {
        fallbackMessage = await translateText(
          fallbackMessage,
          languageContext.responseLanguage,
          'en',
        );
      }
      await memoryService.saveTurn(organizationId, conversationId, question, fallbackMessage);
      return {
        answer: fallbackMessage,
        tokensUsed: 0,
        sourceChunks: 0,
        hasContext: false,
        answered: false,
      };
    }

    const confidence = calculateRetrievalConfidence(relevantChunks);

    if (confidence < MIN_CONFIDENCE_FOR_RAG) {
      let fallbackMessage = resolveNoKnowledgeMessage(orgSettings.noAnswerMessage);
      if (languageContext.responseLanguage !== 'en') {
        fallbackMessage = await translateText(
          fallbackMessage,
          languageContext.responseLanguage,
          'en',
        );
      }
      await memoryService.saveTurn(organizationId, conversationId, question, fallbackMessage);
      return {
        answer: fallbackMessage,
        tokensUsed: 0,
        sourceChunks: 0,
        hasContext: false,
        answered: false,
        confidence,
      };
    }

    // Pass only prior turns as history; generateChatCompletion appends the
    // current question itself, so including it here would duplicate the turn.
    const { answer, tokensUsed } = await generateChatCompletion(resolvedQuestion, {
      mode: 'knowledge',
      history: currentHistory,
      contextChunks: relevantChunks.map((chunk) => ({
        text: chunk.text,
        documentTitle: chunk.documentTitle,
        section: chunk.section,
        pageNumber: chunk.pageNumber,
      })),
      responseLanguage: languageContext.responseLanguage,
    });

    // The model is already instructed to answer in responseLanguage via the
    // system prompt, so no post-hoc translation is needed (doing so would
    // re-translate an already-localized answer and waste a Groq round-trip).
    const finalAnswer = sanitizeAnswer(answer);

    await memoryService.saveTurn(
      organizationId,
      conversationId,
      question,
      finalAnswer,
      {
        preferredLanguage: languageContext.responseLanguage,
        lastTopic: resolvedQuestion.slice(0, 120),
      },
    );

    return {
      answer: finalAnswer,
      tokensUsed,
      sourceChunks: relevantChunks.length,
      hasContext: true,
      answered: true,
      confidence,
    };
  }
}

export const chatService = new ChatService();
