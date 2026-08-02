const { getPrisma } = require('../../config/database');
const { getSignedFileUrl } = require('../../services/storage.service');

const MAX_PRIZES_PER_RAFFLE = 10;

async function getRafflePrizes(raffleId) {
  const prisma = getPrisma();

  const prizes = await prisma.rafflePrize.findMany({
    where: { raffleId: Number(raffleId) },
    orderBy: { position: 'asc' },
    select: {
      id: true,
      position: true,
      createdAt: true,
      product: {
        select: {
          id: true,
          name: true,
          description: true,
          imageKey: true,
          price: true,
          currency: true,
          claimAddress: true,
          provider: {
            select: {
              id: true,
              businessName: true,
              phone: true,
              city: true,
              country: true
            }
          }
        }
      }
    }
  });

  const data = await Promise.all(prizes.map(async (prize) => ({
    ...prize,
    product: {
      ...prize.product,
      imageUrl: prize.product.imageKey ? await getSignedFileUrl(prize.product.imageKey) : null,
      imageKey: undefined
    }
  })));

  return { prizes: data };
}

async function addPrizeToRaffle(userId, role, raffleId, data) {
  const prisma = getPrisma();

  const raffle = await prisma.raffle.findUnique({
    where: { id: Number(raffleId) },
    include: { prizes: true }
  });

  if (!raffle) throw { status: 404, message: 'Rifa no encontrada' };

  const isAdmin = ['admin', 'superadmin'].includes(role);
  if (!isAdmin && raffle.ownerId !== userId) throw { status: 403, message: 'Acceso denegado' };

  // Solo se pueden agregar premios en estado draft
  if (raffle.status !== 'draft') {
    throw { status: 400, message: 'Solo se pueden agregar premios a rifas en estado draft' };
  }

  // Validar máximo 10 premios
  if (raffle.prizes.length >= MAX_PRIZES_PER_RAFFLE) {
    throw { status: 400, message: `Máximo ${MAX_PRIZES_PER_RAFFLE} premios por rifa` };
  }

  // Verificar que el producto existe, tiene stock > 0 y está activo
  const product = await prisma.product.findUnique({ where: { id: data.productId } });
  if (!product) throw { status: 404, message: 'Producto no encontrado' };
  if (!product.isActive || product.stock <= 0) {
    throw { status: 400, message: 'Producto no disponible' };
  }

  // Verificar que el producto no esté ya agregado en esta rifa
  const existing = await prisma.rafflePrize.findFirst({
    where: { raffleId: Number(raffleId), productId: data.productId }
  });
  if (existing) throw { status: 409, message: 'Este producto ya está agregado como premio' };

  const prize = await prisma.rafflePrize.create({
    data: {
      raffleId: Number(raffleId),
      productId: data.productId,
      position: data.position
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          imageKey: true,
          price: true,
          currency: true
        }
      }
    }
  });

  return {
    ...prize,
    product: {
      ...prize.product,
      imageUrl: prize.product.imageKey ? await getSignedFileUrl(prize.product.imageKey) : null,
      imageKey: undefined
    }
  };
}

async function removePrizeFromRaffle(userId, role, raffleId, prizeId) {
  const prisma = getPrisma();

  const raffle = await prisma.raffle.findUnique({ where: { id: Number(raffleId) } });
  if (!raffle) throw { status: 404, message: 'Rifa no encontrada' };

  const isAdmin = ['admin', 'superadmin'].includes(role);
  if (!isAdmin && raffle.ownerId !== userId) throw { status: 403, message: 'Acceso denegado' };

  // Solo se pueden eliminar premios en estado draft
  if (raffle.status !== 'draft') {
    throw { status: 400, message: 'Solo se pueden eliminar premios de rifas en estado draft' };
  }

  const prize = await prisma.rafflePrize.findUnique({ where: { id: Number(prizeId) } });
  if (!prize || prize.raffleId !== Number(raffleId)) {
    throw { status: 404, message: 'Premio no encontrado' };
  }

  await prisma.rafflePrize.delete({ where: { id: Number(prizeId) } });
  return { deleted: true };
}

module.exports = {
  getRafflePrizes,
  addPrizeToRaffle,
  removePrizeFromRaffle
};