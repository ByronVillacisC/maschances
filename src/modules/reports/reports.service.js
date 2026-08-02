// src/modules/reports/reports.service.js
const { getPrisma } = require('../../config/database');
const { parsePagination, buildCursorWhere, getNextCursor } = require('../../utils/pagination');

async function getSalesReport(query) {
  const prisma = getPrisma();
  const { cursor, limit } = parsePagination(query);

  const tickets = await prisma.ticket.findMany({
    where: {
      status: { in: ['paid', 'reserved'] },
      ...buildCursorWhere(cursor)
    },
    take: limit,
    orderBy: { id: 'asc' },
    select: {
      id: true,
      raffleId: true,
      userId: true,
      quantity: true,
      unitPrice: true,
      currency: true,
      status: true,
      createdAt: true,
      raffle: { select: { title: true } }
    }
  });

  const aggregate = await prisma.ticket.aggregate({
    where: { status: 'paid' },
    _sum: { quantity: true },
    _count: { id: true }
  });

  return {
    tickets,
    nextCursor: getNextCursor(tickets, limit),
    summary: {
      totalPaidTickets: aggregate._count.id,
      totalQuantitySold: aggregate._sum.quantity ?? 0
    }
  };
}

async function getUsersReport(query) {
  const prisma = getPrisma();
  const { cursor, limit } = parsePagination(query);

  const users = await prisma.user.findMany({
    where: buildCursorWhere(cursor),
    take: limit,
    orderBy: { id: 'asc' },
    select: {
      id: true,
      email: true,
      role: true,
      firstName: true,
      lastName: true,
      isActive: true,
      isEmailVerified: true,
      createdAt: true
    }
  });

  const total = await prisma.user.count();

  return { users, nextCursor: getNextCursor(users, limit), summary: { total } };
}

async function getRafflesReport(query) {
  const prisma = getPrisma();
  const { cursor, limit } = parsePagination(query);

  const raffles = await prisma.raffle.findMany({
    where: buildCursorWhere(cursor),
    take: limit,
    orderBy: { id: 'asc' },
    select: {
      id: true,
      title: true,
      status: true,
      totalTickets: true,
      ticketPrice: true,
      currency: true,
      drawAt: true,
      createdAt: true,
      ownerId: true,
      _count: { select: { tickets: true } }
    }
  });

  return { raffles, nextCursor: getNextCursor(raffles, limit) };
}

async function getAuditReport(query) {
  const prisma = getPrisma();
  const { cursor, limit } = parsePagination(query);

  const logs = await prisma.auditLog.findMany({
    where: buildCursorWhere(cursor),
    take: limit,
    orderBy: { id: 'desc' },
    select: {
      id: true,
      userId: true,
      action: true,
      entity: true,
      entityId: true,
      meta: true,
      ip: true,
      createdAt: true
    }
  });

  return { logs, nextCursor: getNextCursor(logs, limit) };
}

module.exports = { getSalesReport, getUsersReport, getRafflesReport, getAuditReport };