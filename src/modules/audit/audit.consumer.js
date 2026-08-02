// src/modules/audit/audit.consumer.js
const auditQueue = require('../../queues/audit.queue');
const { getPrisma } = require('../../config/database');
const logger = require('../../utils/logger');

auditQueue.process(async (job) => {
  const { userId, action, entity, entityId, meta, ip } = job.data || {};

  if (!action || !entity) {
    logger.error({ jobId: job.id }, 'Audit: missing required fields');
    throw new Error('Missing action or entity');
  }

  const prisma = getPrisma();
  await prisma.auditLog.create({
    data: {
      userId: userId ?? null,
      action,
      entity,
      entityId: entityId ?? null,
      meta: meta ?? null,
      ip: ip ?? null
    }
  });
});

logger.info('Audit consumer registered');