// src/modules/tickets/reservation.consumer.js
const reservationQueue = require('../../queues/reservation.queue');
const { getPrisma } = require('../../config/database');
const logger = require('../../utils/logger');

reservationQueue.process(async (job) => {
  const { reservationId, ticketId } = job.data;
  const prisma = getPrisma();

  const reservation = await prisma.reservation.findUnique({ where: { id: reservationId } });

  if (!reservation || reservation.status !== 'reserved') {
    logger.info({ reservationId }, 'Reservation already processed or not found, skipping');
    return;
  }

  if (new Date() < reservation.expiresAt) {
    logger.info({ reservationId }, 'Reservation not yet expired, skipping');
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.reservation.update({
      where: { id: reservationId },
      data: { status: 'expired' }
    });

    await tx.ticket.update({
      where: { id: ticketId },
      data: { status: 'expired' }
    });
  });

  logger.info({ reservationId, ticketId }, 'Reservation expired and ticket released');
});

logger.info('Reservation consumer registered');