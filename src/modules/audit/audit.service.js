// src/modules/audit/audit.service.js
const auditQueue = require('../../queues/audit.queue');

/**
 * Encola un evento de auditoría de forma asíncrona (no bloquea el request).
 * @param {{ userId?: number, action: string, entity: string, entityId?: number, meta?: object, ip?: string }} payload
 */
async function logAudit(payload) {
  try {
    await auditQueue.add(payload, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 3000 },
      removeOnComplete: true,
      removeOnFail: false
    });
  } catch (_) {
    // Auditoría no debe romper el flujo principal
  }
}

module.exports = { logAudit };