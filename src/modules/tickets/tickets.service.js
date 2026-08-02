// src/modules/tickets/tickets.service.js
const { getPrisma } = require('../../config/database');
const { parsePagination, buildCursorWhere, getNextCursor } = require('../../utils/pagination');
const reservationQueue = require('../../queues/reservation.queue');
const { logAudit } = require('../audit/audit.service');
const { addHistoryEntry } = require('../history/history.service');

const RESERVATION_TTL_MS = 48 * 60 * 60 * 1000;

async function getMyTickets(userId, query) {
  const prisma = getPrisma();
  const { cursor, limit } = parsePagination(query);

  const tickets = await prisma.ticket.findMany({
    where: { userId: Number(userId), ...buildCursorWhere(cursor) },
    take: limit,
    orderBy: { id: 'desc' },
    include: { raffle: { select: { id: true, title: true, currency: true } } }
  });

  return { tickets, nextCursor: getNextCursor(tickets, limit) };
}

async function getTicketById(ticketId, userId, role) {
  const prisma = getPrisma();
  const ticket = await prisma.ticket.findUnique({
    where: { id: Number(ticketId) },
    include: { raffle: { select: { id: true, title: true, currency: true } } }
  });

  if (!ticket) throw { status: 404, message: 'Ticket no encontrado' };

  const isAdmin = ['admin', 'superadmin'].includes(role);
  if (!isAdmin && ticket.userId !== userId) throw { status: 403, message: 'Acceso denegado' };

  return ticket;
}

async function purchaseTickets(userId, data) {
  const prisma = getPrisma();

  const raffle = await prisma.raffle.findUnique({ where: { id: data.raffleId } });
  if (!raffle || raffle.status !== 'active') {
    throw { status: 400, message: 'El sorteo no está disponible' };
  }

  const soldCount = await prisma.ticket.aggregate({
    where: {
      raffleId: data.raffleId,
      status: { in: ['reserved', 'paid'] }
    },
    _sum: { quantity: true }
  });

  const sold = soldCount._sum.quantity || 0;
  const available = raffle.totalTickets - sold;

  if (data.quantity > available) {
    throw { status: 400, message: `Solo quedan ${available} tickets disponibles` };
  }

  const expiresAt = new Date(Date.now() + RESERVATION_TTL_MS);

  const result = await prisma.$transaction(async (tx) => {
    const reservation = await tx.reservation.create({
      data: {
        raffleId: data.raffleId,
        userId: Number(userId),
        quantity: data.quantity,
        status: 'reserved',
        expiresAt
      }
    });

    const ticket = await tx.ticket.create({
      data: {
        raffleId: data.raffleId,
        userId: Number(userId),
        quantity: data.quantity,
        unitPrice: raffle.ticketPrice,
        currency: raffle.currency,
        status: 'reserved',
        reservationId: reservation.id
      }
    });

    return { ticket, reservation };
  });

  await reservationQueue.add(
    { reservationId: result.reservation.id, ticketId: result.ticket.id },
    { delay: RESERVATION_TTL_MS, attempts: 3, backoff: { type: 'exponential', delay: 5000 } }
  );

  await logAudit({
    userId: Number(userId),
    action: 'purchase_ticket',
    entity: 'Ticket',
    entityId: result.ticket.id,
    meta: { raffleId: data.raffleId, quantity: data.quantity }
  });

  await addHistoryEntry({
    userId: Number(userId),
    type: 'ticket_purchase',
    title: `Reserva de ${data.quantity} ticket(s) para sorteo #${data.raffleId}`,
    meta: { raffleId: data.raffleId, ticketId: result.ticket.id, quantity: data.quantity }
  });

  return { ticket: result.ticket };
}

module.exports = { getMyTickets, getTicketById, purchaseTickets };