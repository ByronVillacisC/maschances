// src/modules/raffles/draw.consumer.js
const drawQueue = require('../../queues/draw.queue');
const emailQueue = require('../../queues/email.queue');
const { getPrisma } = require('../../config/database');
const logger = require('../../utils/logger');

function pickWinnerTicket(tickets, totalQuantity) {
  // tickets: [{ id, userId, quantity }, ...] con quantity > 0
  const target = Math.floor(Math.random() * totalQuantity) + 1; // 1..totalQuantity
  let acc = 0;
  for (const t of tickets) {
    acc += t.quantity;
    if (target <= acc) return t;
  }
  return null;
}

async function enqueueDrawJob({ raffleId, delayMs = 0, jobId }) {
  const id = Number(raffleId);
  const finalJobId = jobId || `raffle:${id}`;
  await drawQueue.add(
    { raffleId: id },
    {
      jobId: finalJobId,
      delay: Math.max(0, Number(delayMs) || 0),
      attempts: 5,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: true,
      removeOnFail: false
    }
  );
}

async function sweepAndEnqueueEligibleRaffles() {
  const prisma = getPrisma();
  const now = new Date();
  const batchSize = Math.min(Math.max(Number(process.env.DRAW_SWEEP_BATCH || 100), 1), 500);

  const raffles = await prisma.raffle.findMany({
    where: {
      status: 'closed',
      OR: [{ drawAt: null }, { drawAt: { lte: now } }],
      draw: { is: null }
    },
    select: { id: true },
    take: batchSize,
    orderBy: { id: 'asc' }
  });

  for (const r of raffles) {
    try {
      await enqueueDrawJob({ raffleId: r.id, delayMs: 0, jobId: `raffle:${r.id}` });
    } catch (_) {
      // job duplicado -> ignorar
    }
  }

  return raffles.length;
}

drawQueue.process(async (job) => {
  const prisma = getPrisma();
  const payload = job.data || {};

  // "cron job" controlado por Bull (repeatable) para recuperar jobs perdidos
  if (payload.type === 'sweep') {
    const count = await sweepAndEnqueueEligibleRaffles();
    logger.info({ sweepCount: count, jobId: job.id }, 'Draw sweep executed');
    return;
  }

  const { raffleId } = payload;
  if (!raffleId) {
    logger.error({ jobId: job.id }, 'Draw: missing raffleId');
    throw new Error('Missing raffleId');
  }

  const raffle = await prisma.raffle.findUnique({
    where: { id: Number(raffleId) },
    select: {
      id: true,
      title: true,
      status: true,
      drawAt: true,
      ownerId: true,
      currency: true,
      draw: { select: { id: true } }
    }
  });

  if (!raffle) {
    logger.info({ raffleId }, 'Draw: raffle not found, skipping');
    return;
  }

  // Si ya existe registro de Draw, no repetir
  if (raffle.draw) {
    logger.info({ raffleId, drawId: raffle.draw.id }, 'Draw: already has draw record, skipping');
    return;
  }

  if (raffle.status !== 'closed') {
    logger.info({ raffleId, status: raffle.status }, 'Draw: raffle not eligible (status), skipping');
    return;
  }

  // Si drawAt no llegó, reprogramar (para compatibilidad con jobs antiguos encolados sin delay)
  if (raffle.drawAt && new Date() < raffle.drawAt) {
    const delayMs = raffle.drawAt.getTime() - Date.now();
    try {
      await enqueueDrawJob({
        raffleId: raffle.id,
        delayMs,
        jobId: `raffle:${raffle.id}:drawAt:${raffle.drawAt.getTime()}`
      });
      logger.info({ raffleId, drawAt: raffle.drawAt }, 'Draw: rescheduled for drawAt');
    } catch (_) {
      // duplicado -> ignorar
    }
    return;
  }

  // Solo tickets pagados
  const paidTickets = await prisma.ticket.findMany({
    where: { raffleId: raffle.id, status: 'paid' },
    select: { id: true, userId: true, quantity: true },
    orderBy: { id: 'asc' }
  });

  const totalPaidQty = paidTickets.reduce((sum, t) => sum + (t.quantity || 0), 0);
  if (totalPaidQty <= 0) {
    logger.info({ raffleId }, 'Draw: no paid tickets, skipping');
    return;
  }

  const winnerTicket = pickWinnerTicket(paidTickets, totalPaidQty);
  if (!winnerTicket) {
    logger.error({ raffleId }, 'Draw: winner selection failed');
    throw new Error('Winner selection failed');
  }

  // Transacción + lock lógico por status (solo 1 job debe poder pasar a drawn)
  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.raffle.updateMany({
      where: { id: raffle.id, status: 'closed' },
      data: { status: 'drawn' }
    });

    if (updated.count !== 1) {
      return { skipped: true };
    }

    const draw = await tx.draw.create({
      data: {
        raffleId: raffle.id,
        winnerUserId: winnerTicket.userId,
        winnerTicketId: winnerTicket.id,
        executedAt: new Date()
      }
    });

    await tx.notification.createMany({
      data: [
        {
          userId: winnerTicket.userId,
          type: 'draw_winner',
          title: '¡Ganaste!',
          message: `Ganaste el sorteo: ${raffle.title}`,
          data: { raffleId: raffle.id, drawId: draw.id, ticketId: winnerTicket.id }
        },
        {
          userId: raffle.ownerId,
          type: 'draw_completed',
          title: 'Sorteo finalizado',
          message: `El sorteo "${raffle.title}" ya tiene ganador.`,
          data: { raffleId: raffle.id, drawId: draw.id, winnerUserId: winnerTicket.userId, ticketId: winnerTicket.id }
        }
      ]
    });

    return {
      skipped: false,
      drawId: draw.id,
      winnerUserId: winnerTicket.userId,
      winnerTicketId: winnerTicket.id
    };
  });

  if (result.skipped) {
    logger.info({ raffleId }, 'Draw: already processed by another worker, skipping');
    return;
  }

  // Encolar emails (si falla email, reintenta sin afectar draw)
  const winnerUser = await prisma.user.findUnique({
    where: { id: result.winnerUserId },
    select: { email: true }
  });

  const ownerUser = await prisma.user.findUnique({
    where: { id: raffle.ownerId },
    select: { email: true }
  });

  const winnerHtml = `
    <p>Hola,</p>
    <p><strong>¡Felicidades!</strong> Ganaste el sorteo: <strong>${raffle.title}</strong>.</p>
    <p>Gracias por participar.</p>
  `;

  const ownerHtml = `
    <p>Hola,</p>
    <p>El sorteo <strong>${raffle.title}</strong> fue ejecutado y ya tiene ganador.</p>
    <p>Draw ID: <strong>${result.drawId}</strong></p>
  `;

  if (winnerUser?.email) {
    await emailQueue.add(
      { to: winnerUser.email, subject: 'Resultado del sorteo', html: winnerHtml },
      { attempts: 5, backoff: { type: 'exponential', delay: 5000 }, removeOnComplete: true }
    );
  }

  if (ownerUser?.email) {
    await emailQueue.add(
      { to: ownerUser.email, subject: 'Sorteo ejecutado', html: ownerHtml },
      { attempts: 5, backoff: { type: 'exponential', delay: 5000 }, removeOnComplete: true }
    );
  }

  logger.info({ raffleId, drawId: result.drawId, winnerUserId: result.winnerUserId }, 'Draw: completed');
});

logger.info('Draw consumer registered');