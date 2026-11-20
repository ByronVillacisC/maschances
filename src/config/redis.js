// src/config/redis.js
const Redis = require('ioredis');
const logger = require('../utils/logger');

let redis;

function createRedisClient() {
  const client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    lazyConnect: true
  });

  client.on('error', (err) => {
    logger.error({ err }, 'Redis connection error');
  });

  client.on('connect', () => {
    logger.info('Redis connected');
  });

  return client;
}

async function connectRedis() {
  if (!redis) {
    redis = createRedisClient();
  }
  await redis.ping();
  return redis;
}

function getRedis() {
  if (!redis) {
    redis = createRedisClient();
  }
  return redis;
}

module.exports = { connectRedis, getRedis };
