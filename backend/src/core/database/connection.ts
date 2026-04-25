import mongoose from 'mongoose';
import { config } from '@shared/config';
import { logger } from '@shared/logger';

const RECONNECT_DELAY_MS = 5000;

async function connectWithRetry(attempt = 1): Promise<void> {
  try {
    await mongoose.connect(config.mongo.uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    logger.info('✅ MongoDB connected successfully');
  } catch (error) {
    logger.error(`MongoDB connection failed (attempt ${attempt}):`, error);
    if (attempt < 5) {
      logger.info(`Retrying in ${RECONNECT_DELAY_MS}ms...`);
      await new Promise((resolve) => setTimeout(resolve, RECONNECT_DELAY_MS));
      return connectWithRetry(attempt + 1);
    }
    logger.error('MongoDB connection failed after 5 attempts. Exiting...');
    process.exit(1);
  }
}

export async function connectDatabase(): Promise<void> {
  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected. Attempting reconnect...');
  });

  mongoose.connection.on('reconnected', () => {
    logger.info('MongoDB reconnected');
  });

  mongoose.connection.on('error', (error) => {
    logger.error('MongoDB error:', error);
  });

  await connectWithRetry();
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected');
}
