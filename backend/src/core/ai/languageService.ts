import axios from 'axios';
import { config } from '@shared/config';
import { logger } from '@shared/logger';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export type SupportedLanguage = 'en' | 'ar' | 'ur' | 'auto';

export interface LanguageContext {
  detected: 'en' | 'ar' | 'ur';
  responseLanguage: 'en' | 'ar' | 'ur';
}

const URDU_SPECIFIC = /[\u0679\u0688\u0691\u0698\u06AF\u06BA\u06BE\u06C1\u06D2\u06CC\u06D3]/;
const ARABIC_SCRIPT = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

/**
 * Detect language from text using script heuristics.
 */
export function detectLanguage(text: string): 'en' | 'ar' | 'ur' {
  if (!ARABIC_SCRIPT.test(text)) return 'en';
  if (URDU_SPECIFIC.test(text)) return 'ur';
  return 'ar';
}

export function resolveResponseLanguage(
  question: string,
  configuredLanguage: SupportedLanguage = 'auto',
): LanguageContext {
  const detected = detectLanguage(question);

  if (configuredLanguage === 'auto') {
    return { detected, responseLanguage: detected };
  }

  return { detected, responseLanguage: configuredLanguage };
}

/**
 * Translate text using Groq. Returns original text on failure.
 */
export async function translateText(
  text: string,
  targetLanguage: 'en' | 'ar' | 'ur',
  sourceLanguage?: 'en' | 'ar' | 'ur',
): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) return text;

  const langNames: Record<string, string> = {
    en: 'English',
    ar: 'Arabic',
    ur: 'Urdu',
  };

  const sourceHint = sourceLanguage ? ` from ${langNames[sourceLanguage]}` : '';
  const prompt = `Translate the following text${sourceHint} to ${langNames[targetLanguage]}. Return ONLY the translation, no explanations or quotes.\n\nText:\n${trimmed}`;

  try {
    const response = await axios.post<{ choices: { message: { content: string } }[] }>(
      GROQ_API_URL,
      {
        model: config.groq.model,
        messages: [
          {
            role: 'system',
            content:
              'You are a professional translator. Output only the translated text without any preamble.',
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 1024,
        temperature: 0.1,
      },
      {
        headers: {
          Authorization: `Bearer ${config.groq.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 20000,
      },
    );

    const translated = response.data.choices[0]?.message?.content?.trim();
    return translated || text;
  } catch (error) {
    logger.error('Translation failed, using original text:', error);
    return text;
  }
}

export function getLanguagePromptInstruction(language: 'en' | 'ar' | 'ur'): string {
  const instructions: Record<'en' | 'ar' | 'ur', string> = {
    en: 'Respond in English.',
    ar: 'Respond in Modern Standard Arabic. Use clear, natural Arabic.',
    ur: 'Respond in Urdu. Use natural Urdu suitable for general audiences.',
  };
  return instructions[language];
}

export function getFontClassForLanguage(language: 'en' | 'ar' | 'ur'): string {
  if (language === 'ur') return 'font-urdu';
  if (language === 'ar') return 'font-arabic';
  return '';
}
