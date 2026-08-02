const { getPrisma } = require('../config/database');
const { error } = require('../utils/response');

async function idempotencyMiddleware(req, res, next) {
  const key = req.headers['x-idempotency-key'];
  if (!key) return next();

  const prisma = getPrisma();

  try {
    const existing = await prisma.idempotencyKey.findUnique({ where: { key } });

    if (existing) {
      if (new Date() < existing.expiresAt) {
        return res.status(200).json(existing.response);
      }
      await prisma.idempotencyKey.delete({ where: { key } });
    }

    const originalJson = res.json.bind(res);
    res.json = async (body) => {
      try {
        await prisma.idempotencyKey.create({
          data: {
            key,
            userId: req.user?.id ?? null,
            response: body,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
          }
        });
      } catch (_) {}
      return originalJson(body);
    };

    next();
  } catch (err) {
    return error(res, 'Error de idempotencia', 500);
  }
}

module.exports = { idempotencyMiddleware };