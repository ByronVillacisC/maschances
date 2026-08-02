// src/main.js
require('dotenv').config();
const app = require('./app');
const { connectDatabase } = require('./config/database');
const { connectRedis } = require('./config/redis');
const { initSentry, captureException } = require('./config/sentry');
const logger = require('./utils/logger');

const PORT = process.env.PORT || process.env.APP_PORT || 4000;

async function bootstrap() {
  initSentry();

  await connectDatabase();
  await connectRedis();

  const server = app.listen(PORT, () => {
    logger.info(`+CHANCES API running on port ${PORT}`);
  });

  server.keepAliveTimeout = 65000;
  server.headersTimeout   = 70000;

  const shutdown = async (signal) => {
    logger.info(`${signal} received. Shutting down...`);
    server.close(() => process.exit(0));
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.error({ reason }, 'Unhandled rejection');
    captureException(reason);
  });

  process.on('uncaughtException', (err) => {
    logger.error({ err }, 'Uncaught exception');
    captureException(err);
    process.exit(1);
  });
}

bootstrap().catch((err) => {
  logger.error('API failed to start:', err);
  process.exit(1);
});