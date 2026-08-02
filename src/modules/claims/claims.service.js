// src/modules/claims/claims.service.js
const { getPrisma } = require('../../config/database');
const { parsePagination, buildCursorWhere, getNextCursor } = require('../../utils/pagination');

const VALID_STATUSES = ['open', 'in_review', 'resolved', 'rejected'];

async function getClaims(userId, role, query) {
  const prisma = getPrisma();
  const { cursor, limit } = parsePagination(query);

  const isAdmin = ['admin', 'superadmin'].includes(role);

  const where = {
    ...buildCursorWhere(cursor),
    ...(isAdmin ? {} : { userId: Number(userId) })
  };

  const claims = await prisma.claim.findMany({
    where,
    take: limit,
    orderBy: { id: 'desc' },
    select: {
      id: true,
      userId: true,
      raffleId: true,
      ticketId: true,
      status: true,
      subject: true,
      description: true,
      resolution: true,
      resolvedAt: true,
      createdAt: true,
      updatedAt: true
    }
  });

  return { claims, nextCursor: getNextCursor(claims, limit) };
}

async function getClaimById(id, userId, role) {
  const prisma = getPrisma();
  const claim = await prisma.claim.findUnique({ where: { id: Number(id) } });
  if (!claim) throw { status: 404, message: 'Reclamo no encontrado' };

  const isAdmin = ['admin', 'superadmin'].includes(role);
  if (!isAdmin && claim.userId !== Number(userId)) throw { status: 403, message: 'Acceso denegado' };

  return claim;
}

async function createClaim(userId, data) {
  const prisma = getPrisma();
  const claim = await prisma.claim.create({
    data: {
      userId: Number(userId),
      raffleId: data.raffleId ?? null,
      ticketId: data.ticketId ?? null,
      subject: data.subject,
      description: data.description,
      status: 'open'
    }
  });
  return claim;
}

async function updateClaim(id, userId, role, data) {
  const prisma = getPrisma();
  const claim = await prisma.claim.findUnique({ where: { id: Number(id) } });
  if (!claim) throw { status: 404, message: 'Reclamo no encontrado' };

  const isAdmin = ['admin', 'superadmin'].includes(role);
  if (!isAdmin) throw { status: 403, message: 'Solo admins pueden actualizar reclamos' };

  if (data.status && !VALID_STATUSES.includes(data.status)) {
    throw { status: 400, message: `Estado inválido. Valores permitidos: ${VALID_STATUSES.join(', ')}` };
  }

  const updateData = {};
  if (data.status !== undefined) updateData.status = data.status;
  if (data.resolution !== undefined) updateData.resolution = data.resolution;
  if (data.status === 'resolved' || data.status === 'rejected') {
    updateData.resolvedAt = new Date();
  }

  const updated = await prisma.claim.update({
    where: { id: Number(id) },
    data: updateData
  });

  return updated;
}

module.exports = { getClaims, getClaimById, createClaim, updateClaim };