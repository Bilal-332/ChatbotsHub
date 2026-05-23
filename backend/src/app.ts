import 'express-async-errors';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';

import { config } from '@shared/config';
import { logger } from '@shared/logger';
import { globalRateLimiter } from '@core/middleware/rateLimiter';
import { errorHandler, notFoundHandler } from '@core/middleware/errorHandler';

import { authRouter } from '@modules/auth/auth.routes';
import { organizationRouter } from '@modules/organizations/organization.routes';
import { documentRouter } from '@modules/documents/document.routes';
import { chatRouter } from '@modules/chat/chat.routes';
import { adminRouter } from '@modules/admin/admin.routes';

export function createApp(): express.Application {
  const app = express();

  // ─── Security Headers ───────────────────────────────────────────────────────
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false, // Allow embedding for widget iframe
      contentSecurityPolicy: config.isProduction
        ? undefined
        : false,
      frameguard : false, // Allow framing for widget iframe
    }),
  );

  // ─── CORS ───────────────────────────────────────────────────────────────────
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, Postman)
        if (!origin) return callback(null, true);

        const allowedOrigins = [config.frontendUrl, 'null'];
        if (allowedOrigins.includes(origin) || !config.isProduction) {
          callback(null, true);
        } else {
          callback(new Error(`CORS: origin "${origin}" not allowed`));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
    }),
  );

  // ─── Compression ────────────────────────────────────────────────────────────
  app.use(compression());

  // ─── Body Parsing ───────────────────────────────────────────────────────────
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // ─── Request Logging ────────────────────────────────────────────────────────
  if (!config.isProduction) {
    app.use(morgan('dev'));
  } else {
    app.use(
      morgan('combined', {
        stream: { write: (msg) => logger.info(msg.trim()) },
      }),
    );
  }

  // ─── Global Rate Limiter ────────────────────────────────────────────────────
  app.use(globalRateLimiter);

  // ─── Health Check ───────────────────────────────────────────────────────────
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // ─── API Routes ─────────────────────────────────────────────────────────────
  app.use('/api/auth', authRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/organizations', organizationRouter);
  app.use('/api/documents', documentRouter);
  app.use('/api/chat', chatRouter);

  // ─── 404 Handler ────────────────────────────────────────────────────────────
  app.use(notFoundHandler);

  // ─── Global Error Handler ───────────────────────────────────────────────────
  app.use(errorHandler);

  return app;
}
