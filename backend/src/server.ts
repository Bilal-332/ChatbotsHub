import { createApp } from './app';
import { connectDatabase } from '@core/database/connection';
import { initializeVectorStore } from '@core/vector/qdrantClient';
import { config } from '@shared/config';
import { logger } from '@shared/logger';
import { startPlanExpiryScheduler } from '@modules/plans/plan.service';

async function bootstrap(): Promise<void> {
  try {
    // Connect to MongoDB
    await connectDatabase();

    // Initialize Qdrant collection
    await initializeVectorStore();

    // Start plan expiry scheduler (hourly check)
    startPlanExpiryScheduler();

    // Create and start Express app
    const app = createApp();
    const server = app.listen(config.port, () => {
      logger.info(`🚀 Server running on port ${config.port} [${config.nodeEnv}]`);
    });

    // ─── Graceful Shutdown ─────────────────────────────────────────────────
    const shutdown = async (signal: string): Promise<void> => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        const { disconnectDatabase } = await import('@core/database/connection');
        await disconnectDatabase();
        logger.info('Server shut down cleanly');
        process.exit(0);
      });

      // Force exit after 10 seconds
      setTimeout(() => {
        logger.error('Could not close connections in time. Forcing exit.');
        process.exit(1);
      }, 10_000);
    };

    process.on('SIGTERM', () => void shutdown('SIGTERM'));
    process.on('SIGINT', () => void shutdown('SIGINT'));

    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled Promise Rejection:', reason);
      void shutdown('unhandledRejection');
    });

    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      void shutdown('uncaughtException');
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

void bootstrap();
