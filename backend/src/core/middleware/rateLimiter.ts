import rateLimit from 'express-rate-limit';
import { config } from '@shared/config';

export const globalRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  skip: (_req) => process.env.NODE_ENV === 'test',
});

export const chatRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: config.rateLimit.chatMax,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Rate limit by API key or IP
    return (req.headers['x-api-key'] as string) ?? req.ip ?? 'unknown';
  },
  message: {
    success: false,
    message: 'Chat rate limit exceeded. Please slow down.',
    code: 'CHAT_RATE_LIMIT',
  },
  skip: (_req) => process.env.NODE_ENV === 'test',
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip ?? 'unknown',
  message: {
    success: false,
    message: 'Too many auth attempts. Please try again in 15 minutes.',
    code: 'AUTH_RATE_LIMIT',
  },
  skip: (_req) => process.env.NODE_ENV === 'test',
});
