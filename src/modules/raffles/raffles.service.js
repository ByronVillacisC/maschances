const { getPrisma } = require('../../config/database');
const { uploadFile, deleteFile, getSignedFileUrl } = require('../../services/storage.service');
const { validateFile } = require('../../utils/fileValidator');
const { parsePagination, buildCursorWhere, getNextCursor } = require('../../utils/pagination');

// FASE 5
const drawQueue = require('../../queues/draw.queue');

const SAFE_RAFFLE_FIELDS = {
  id: true,
  packageId: true,
  ownerId: true,
  title: true,
  description: true,
  prizeImageKey: true,
  totalTickets: true,
  ticketPrice: true,
  currency: true,
  status: true,
  // CAMBIO: incluir shareLink en los campos seguros
  shareLink: true,
  drawAt: true,
  createdAt: true,
  updatedAt: true
};

async function _withSignedUrls(raffle) {
  return {
    ...raffle,
    prizeImageUrl: raffle.prizeImageKey ? await getSignedFileUrl(raffle.prizeImageKey) : null,
    prizeImageKey: undefined
  };
}

async function getRaffles(query) {
  const prisma = getPrisma();
  const { cursor, limit } = parsePagination(query);
  const where = buildCursorWhere(cursor);

  const raffles = await prisma.raffle.findMany({
    where,
    take: limit,
    orderBy: { id: 'asc' },
    select: SAFE_RAFFLE_FIELDS
  });

  const data = await Promise.all(raffles.map(_withSignedUrls));
  return { raffles: data, nextCursor: getNextCursor(raffles, limit) };
}

async function getRaffleById(id) {
  const prisma = getPrisma();
  const raffle = await prisma.raffle.findUnique({
    where: { id: Number(id) },
    select: SAFE_RAFFLE_FIELDS
  });
  if (!raffle) throw { status: 404, message: 'Sorteo no encontrado' };
  return _withSignedUrls(raffle);
}

async function createRaffle(ownerId, data) {
  const prisma = getPrisma();

  // Verificar que el package existe y pertenece al owner (o es admin)
  const pkg = await prisma.package.findUnique({ where: { id: data.packageId } });
  if (!pkg) throw { status: 404, message: 'Paquete no encontrado' };
  if (pkg.ownerId !== ownerId) throw { status: 403, message: 'No eres el owner de este paquete' };

  const raffle = await prisma.raffle.create({
    data: {
      packageId: data.packageId,
      ownerId,
      title: data.title,
      description: data.description,
      totalTickets: data.totalTickets,
      ticketPrice: data.ticketPrice,
      currency: data.currency || 'USD',
      drawAt: data.drawAt ? new Date(data.drawAt) : null,
      // CAMBIO: estado inicial 'active' en lugar de 'draft'
      status: 'active'
    },
    select: SAFE_RAFFLE_FIELDS
  });

  // CAMBIO: generar automáticamente el link compartible
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const shareLink = `${frontendUrl}/catalog/${raffle.id}`;

  // Actualizar el sorteo con el shareLink generado
  const updatedRaffle = await prisma.raffle.update({
    where: { id: raffle.id },
    data: { shareLink },
    select: SAFE_RAFFLE_FIELDS
  });

  return _withSignedUrls(updatedRaffle);
}

async function updateRaffle(id, userId, role, data) {
  const prisma = getPrisma();
  const raffle = await prisma.raffle.findUnique({ where: { id: Number(id) } });
  if (!raffle) throw { status: 404, message: 'Sorteo no encontrado' };

  const isAdmin = ['admin', 'superadmin'].includes(role);
  if (!isAdmin && raffle.ownerId !== userId) throw { status: 403, message: 'Acceso denegado' };

  const prevStatus = raffle.status;

  const updateData = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.totalTickets !== undefined) updateData.totalTickets = data.totalTickets;
  if (data.ticketPrice !== undefined) updateData.ticketPrice = data.ticketPrice;
  if (data.currency !== undefined) updateData.currency = data.currency;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.drawAt !== undefined) updateData.drawAt = new Date(data.drawAt);

  const updated = await prisma.raffle.update({
    where: { id: Number(id) },
    data: updateData,
    select: SAFE_RAFFLE_FIELDS
  });

  // FASE 5: producer → al cerrar, encolar job draw.
  // IMPORTANTE: si existe drawAt futuro, se encola con delay hasta drawAt (para no "skipping" prematuro).
  if (updateData.status === 'closed' && prevStatus !== 'closed' && prevStatus !== 'drawn') {
    const jobId = `raffle:${updated.id}`;
    const delayMs =
      updated.drawAt instanceof Date
        ? Math.max(0, updated.drawAt.getTime() - Date.now())
        : 0;

    try {
      await drawQueue.add(
        { raffleId: updated.id },
        {
          jobId,
          delay: delayMs,
          attempts: 5,
          backoff: { type: 'exponential', delay: 5000 },
          removeOnComplete: true,
          removeOnFail: false
        }
      );
    } catch (_) {
      // Si el job ya existe, no hacemos nada (evita duplicidad)
    }
  }

  return _withSignedUrls(updated);
}

async function deleteRaffle(id, userId, role) {
  const prisma = getPrisma();
  const raffle = await prisma.raffle.findUnique({ where: { id: Number(id) } });
  if (!raffle) throw { status: 404, message: 'Sorteo no encontrado' };

  const isAdmin = ['admin', 'superadmin'].includes(role);
  if (!isAdmin && raffle.ownerId !== userId) throw { status: 403, message: 'Acceso denegado' };

  // CAMBIO: permitir eliminar sorteos en draft o active (antes solo draft)
  if (!['draft', 'active'].includes(raffle.status)) {
    throw { status: 400, message: 'Solo se pueden eliminar sorteos en estado draft o active' };
  }

  await deleteFile(raffle.prizeImageKey);
  await prisma.raffle.delete({ where: { id: Number(id) } });
  return { deleted: true };
}

async function uploadPrizeImage(id, userId, role, file) {
  const prisma = getPrisma();
  const raffle = await prisma.raffle.findUnique({ where: { id: Number(id) } });
  if (!raffle) throw { status: 404, message: 'Sorteo no encontrado' };

  const isAdmin = ['admin', 'superadmin'].includes(role);
  if (!isAdmin && raffle.ownerId !== userId) throw { status: 403, message: 'Acceso denegado' };

  validateFile(file.buffer, file.mimetype, 'image');

  await deleteFile(raffle.prizeImageKey);

  const key = await uploadFile(file.buffer, 'raffles/prizes', file.mimetype);
  await prisma.raffle.update({ where: { id: Number(id) }, data: { prizeImageKey: key } });

  return { prizeImageUrl: await getSignedFileUrl(key) };
}

module.exports = {
  getRaffles,
  getRaffleById,
  createRaffle,
  updateRaffle,
  deleteRaffle,
  uploadPrizeImage
};
