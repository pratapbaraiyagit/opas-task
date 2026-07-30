import Redis from 'ioredis';

import { env } from '@config/env';
import { logger } from '@utils/logger';

let redisClient: Redis | null = null;
let redisPublisher: Redis | null = null;
let redisSubscriber: Redis | null = null;

const createRedisClient = (name: string): Redis => {
  const client = new Redis({
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD || undefined,
    retryStrategy: (times: number) => {
      if (times > 10) {
        logger.error(`Redis ${name}: Max retries exceeded`);
        return null;
      }
      const delay = Math.min(times * 200, 5000);
      return delay;
    },
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  });

  client.on('connect', () => {
    logger.info(`✅ Redis ${name} connected`);
  });

  client.on('error', (error) => {
    logger.error(`Redis ${name} error:`, error.message);
  });

  client.on('close', () => {
    logger.warn(`Redis ${name} connection closed`);
  });

  return client;
};

export const connectRedis = async (): Promise<void> => {
  try {
    redisClient = createRedisClient('client');
    redisPublisher = createRedisClient('publisher');
    redisSubscriber = createRedisClient('subscriber');

    await Promise.all([
      redisClient.connect(),
      redisPublisher.connect(),
      redisSubscriber.connect(),
    ]);

    logger.info('✅ All Redis connections established');
  } catch (error) {
    logger.error('Failed to connect to Redis:', error);
    logger.warn('⚠️ Application will continue without Redis (reduced functionality)');
  }
};

export const getRedisClient = (): Redis => {
  if (!redisClient) {
    throw new Error('Redis client not initialized. Call connectRedis() first.');
  }
  return redisClient;
};

export const getRedisPublisher = (): Redis => {
  if (!redisPublisher) {
    throw new Error('Redis publisher not initialized. Call connectRedis() first.');
  }
  return redisPublisher;
};

export const getRedisSubscriber = (): Redis => {
  if (!redisSubscriber) {
    throw new Error('Redis subscriber not initialized. Call connectRedis() first.');
  }
  return redisSubscriber;
};

export const disconnectRedis = async (): Promise<void> => {
  try {
    const clients = [redisClient, redisPublisher, redisSubscriber].filter(Boolean) as Redis[];
    await Promise.all(clients.map((client) => client.quit()));
    logger.info('Redis disconnected gracefully');
  } catch (error) {
    logger.error('Error disconnecting Redis:', error);
  }
};
