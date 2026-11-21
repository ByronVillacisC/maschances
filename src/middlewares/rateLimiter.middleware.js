// src/middlewares/rateLimiter.middleware.js
const { getRedis } = require('../config/redis');
const { error } = require('../utils/response');

/**
 * Crea un middleware de rate limiting usando Redis como store con timeout rápido.
 * @param {{ windowMs: number, max: number, keyPrefix: string }} options
 */
function createRateLimiter({ windowMs = 60000, max = 100, keyPrefix = 'rl' }) {
  return async (req, res, next) => {
    if (!process.env.REDIS_URL) return next();

    try {
      const redis = getRedis();
      const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
      const key = `${keyPrefix}:${ip}`;
      const windowSec = Math.ceil(windowMs / 1000);

      // Si Redis tarda más de 1.5s, ignorar rate-limit para no causar 504 en Vercel
      const current = await Promise.race([
        redis.incr(key),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Redis timeout')), 1500))
      ]);

      if (current === 1) {
        await redis.expire(key, windowSec);
      }

      if (current > max) {
        res.set('Retry-After', String(windowSec));
        return error(res, 'Demasiadas solicitudes. Intenta más tarde.', 429);
      }

      next();
    } catch (_) {
      // Si Redis falla o tarda mucho, no bloquear el request
      next();
    }
  };
}

const globalLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: Number(process.env.RATE_LIMIT_GLOBAL || 200),
  keyPrefix: 'rl:global'
});

const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_AUTH || 20),
  keyPrefix: 'rl:auth'
});

module.exports = { createRateLimiter, globalLimiter, authLimiter };
