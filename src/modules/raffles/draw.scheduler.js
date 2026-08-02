// src/modules/raffles/draw.scheduler.js
const drawQueue = require('../../queues/draw.queue');
const logger = require('../../utils/logger');

/**
 * Registra un "cron job" controlado por Bull (repeatable job).
 * Objetivo: re-encolar sorteos elegibles si se perdió el job original o si el worker estuvo abajo.
 * No usa cron del SO (cumple invariantes).
 */
async function registerDrawSweepCron() {
  const cron = process.env.DRAW_SWEEP_CRON || '*/1 * * * *'; // cada 1 minuto
  const jobId = 'draw:sweep';

  try {
    await drawQueue.add(
      { type: 'sweep' },
      {
        jobId,
        repeat: { cron },
        removeOnComplete: true,
        removeOnFail: false
      }
    );
    logger.info({ cron }, 'Draw sweep cron registered');
  } catch (err) {
    // Si ya existe, Bull normalmente no duplica; si falla, lo dejamos logueado.
    logger.error({ err }, 'Failed to register draw sweep cron');
  }
}

module.exports = { registerDrawSweepCron };