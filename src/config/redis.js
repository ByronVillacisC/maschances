// src/config/redis.js
const Redis = require('ioredis');
const logger = require('../utils/logger');

let redis;

async function connectRedis() {
  redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: true
  });

  redis.on('error', (err) => {
    logger.error({ err }, 'Redis connection error');
  });

  redis.on('connect', () => {
    logger.info('Redis connected');
  });

  // Verificar conexión activa antes de continuar
  await redis.ping();
}

function getRedis() {
  return redis;
}

module.exports = { connectRedis, getRedis };