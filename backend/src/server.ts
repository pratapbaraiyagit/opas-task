import http from 'http';

import { env } from '@config/env';
import { connectDatabase, disconnectDatabase } from '@config/database';
import { connectRedis, disconnectRedis } from '@config/redis';
import { logger } from '@utils/logger';
import app from './app';

const server = http.createServer(app);

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();
    await connectRedis();

    const { initializeSocket } = await import('./modules/socket/socket.handler');
    await initializeSocket(server);

    server.listen(env.PORT, () => {
      logger.info(`🚀 Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
      logger.info(`📚 API Docs available at http://localhost:${env.PORT}/api-docs`);
      logger.info(`💚 Health check at http://localhost:${env.PORT}/api/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// ─── Graceful Shutdown ───────────────────────────────────────────────────────
const gracefulShutdown = async (signal: string): Promise<void> => {
  logger.info(`\n${signal} received. Starting graceful shutdown...`);

  server.close(async () => {
    logger.info('HTTP server closed');

    try {
      await disconnectDatabase();
      await disconnectRedis();
      logger.info('All connections closed. Exiting process.');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown:', error);
      process.exit(1);
    }
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time. Forcing shutdown.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason: Error) => {
  logger.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

startServer();

export { server };
