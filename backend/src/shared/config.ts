import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000'),
  FRONTEND_URL: z.string().url(),
  MONGODB_URI: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  QDRANT_URL: z.string().url().default('http://localhost:6333'),
  QDRANT_API_KEY: z.string().optional(),
  GROQ_API_KEY: z.string().min(1),
  GROQ_MODEL: z.string().default('llama3-8b-8192'),
  HUGGINGFACE_API_KEY: z.string().min(1),
  HUGGINGFACE_EMBEDDING_MODEL: z
    .string()
    .default('BAAI/bge-small-en-v1.5'),
  MAX_FILE_SIZE_MB: z.string().default('10'),
  UPLOAD_TEMP_DIR: z.string().default('./tmp/uploads'),
  RATE_LIMIT_WINDOW_MS: z.string().default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100'),
  CHAT_RATE_LIMIT_MAX: z.string().default('30'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const config = {
  nodeEnv: parsed.data.NODE_ENV,
  port: parseInt(parsed.data.PORT, 10),
  frontendUrl: parsed.data.FRONTEND_URL,
  mongo: {
    uri: parsed.data.MONGODB_URI,
  },
  jwt: {
    accessSecret: parsed.data.JWT_ACCESS_SECRET,
    refreshSecret: parsed.data.JWT_REFRESH_SECRET,
    accessExpiresIn: parsed.data.JWT_ACCESS_EXPIRES_IN,
    refreshExpiresIn: parsed.data.JWT_REFRESH_EXPIRES_IN,
  },
  qdrant: {
    url: parsed.data.QDRANT_URL,
    apiKey: parsed.data.QDRANT_API_KEY,
  },
  groq: {
    apiKey: parsed.data.GROQ_API_KEY,
    model: parsed.data.GROQ_MODEL,
  },
  huggingface: {
    apiKey: parsed.data.HUGGINGFACE_API_KEY,
    embeddingModel: parsed.data.HUGGINGFACE_EMBEDDING_MODEL,
  },
  upload: {
    maxFileSizeMb: parseInt(parsed.data.MAX_FILE_SIZE_MB, 10),
    tempDir: parsed.data.UPLOAD_TEMP_DIR,
  },
  rateLimit: {
    windowMs: parseInt(parsed.data.RATE_LIMIT_WINDOW_MS, 10),
    maxRequests: parseInt(parsed.data.RATE_LIMIT_MAX_REQUESTS, 10),
    chatMax: parseInt(parsed.data.CHAT_RATE_LIMIT_MAX, 10),
  },
  isProduction: parsed.data.NODE_ENV === 'production',
} as const;
