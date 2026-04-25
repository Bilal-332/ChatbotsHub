import { generateEmbedding } from '@core/ai/embeddingService';
import { searchSimilarChunks } from '@core/vector/qdrantClient';
import { generateChatCompletion } from '@core/ai/chatService';
import { AppError } from '@shared/errors';

const MIN_RELEVANCE_SCORE = 0.3;

export interface ChatQuery {
  question: string;
  organizationId: string;
}

export interface ChatResponse {
  answer: string;
  tokensUsed: number;
  sourceChunks: number;
  hasContext: boolean;
}

export class ChatService {
  async query(params: ChatQuery): Promise<ChatResponse> {
    const { question, organizationId } = params;

    if (!question?.trim()) {
      throw new AppError('Question cannot be empty', 400, 'INVALID_INPUT');
    }

    // 1. Embed the user's question
    const questionVector = await generateEmbedding(question);

    // 2. Retrieve relevant chunks from Qdrant
    const chunks = await searchSimilarChunks(questionVector, organizationId, 7);

    // 3. Filter by relevance score threshold
    const relevantChunks = chunks.filter((c) => c.score >= MIN_RELEVANCE_SCORE);

    if (relevantChunks.length === 0) {
      return {
        answer: "I don't have enough information in my knowledge base to answer that question.",
        tokensUsed: 0,
        sourceChunks: 0,
        hasContext: false,
      };
    }

    // 4. Generate completion with Groq
    const contextTexts = relevantChunks.map((c) => c.text);
    const { answer, tokensUsed } = await generateChatCompletion(question, contextTexts);

    return {
      answer,
      tokensUsed,
      sourceChunks: relevantChunks.length,
      hasContext: true,
    };
  }
}

export const chatService = new ChatService();
