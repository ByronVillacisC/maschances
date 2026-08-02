// src/workers/worker.main.js
require('dotenv').config();
const { connectDatabase } = require('../config/database');
const { connectRedis } = require('../config/redis');
const logger = require('../utils/logger');

async function bootstrap() {
  await connectDatabase();
  await connectRedis();

  // Consumers registrados por fase
  require('../modules/tickets/reservation.consumer');

  // FASE 5
  require('../modules/raffles/draw.consumer');
  require('../modules/notifications/email.consumer');

  // FASE 5 (cron controlado por Bull, no OS cron)
  const { registerDrawSweepCron } = require('../modules/raffles/draw.scheduler');
  await registerDrawSweepCron();

  // FASE 6
  require('../modules/audit/audit.consumer');

  logger.info('+CHANCES Worker running');
}

const shutdown = (signal) => {
  logger.info(`${signal} received. Worker shutting down...`);
  process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

bootstrap().catch((err) => {
  logger.error({ err }, 'Worker failed to start');
  process.exit(1);
});