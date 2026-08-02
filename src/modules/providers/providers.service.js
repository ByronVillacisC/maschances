const { getPrisma } = require('../../config/database');
const { uploadFile, deleteFile, getSignedFileUrl } = require('../../services/storage.service');
const { validateFile } = require('../../utils/fileValidator');
const { parsePagination, buildCursorWhere, getNextCursor } = require('../../utils/pagination');

const SAFE_PROVIDER_FIELDS = {
  id: true,
  userId: true,
  businessName: true,
  description: true,
  logoKey: true,
  phone: true,
  address: true,
  city: true,
  country: true,
  isActive: true,
  createdAt: true,
  updatedAt: true
};

async function _withSignedUrls(provider) {
  return {
    ...provider,
    logoUrl: provider.logoKey ? await getSignedFileUrl(provider.logoKey) : null,
    logoKey: undefined
  };
}

async function getProviderProfile(userId) {
  const prisma = getPrisma();
  const provider = await prisma.provider.findUnique({
    where: { userId },
    select: SAFE_PROVIDER_FIELDS
  });
  if (!provider) throw { status: 404, message: 'Perfil de proveedor no encontrado' };
  return _withSignedUrls(provider);
}

async function updateProviderProfile(userId, data) {
  const prisma = getPrisma();
  const provider = await prisma.provider.findUnique({ where: { userId } });
  if (!provider) throw { status: 404, message: 'Perfil de proveedor no encontrado' };

  const updated = await prisma.provider.update({
    where: { userId },
    data,
    select: SAFE_PROVIDER_FIELDS
  });
  return _withSignedUrls(updated);
}

async function uploadProviderLogo(userId, file) {
  const prisma = getPrisma();
  const provider = await prisma.provider.findUnique({ where: { userId } });
  if (!provider) throw { status: 404, message: 'Perfil de proveedor no encontrado' };

  validateFile(file.buffer, file.mimetype, 'image');

  await deleteFile(provider.logoKey);

  const key = await uploadFile(file.buffer, 'providers/logos', file.mimetype);
  await prisma.provider.update({ where: { userId }, data: { logoKey: key } });

  return { logoUrl: await getSignedFileUrl(key) };
}

async function getActiveRafflesWithMyProducts(userId, query) {
  const prisma = getPrisma();
  const { cursor, limit } = parsePagination(query);

  const provider = await prisma.provider.findUnique({ where: { userId } });
  if (!provider) throw { status: 404, message: 'Perfil de proveedor no encontrado' };

  const raffles = await prisma.raffle.findMany({
    where: {
      status: { in: ['active', 'closed'] },
      prizes: {
        some: {
          product: { providerId: provider.id }
        }
      }
    },
    take: limit,
    orderBy: { id: 'asc' },
    select: {
      id: true,
      title: true,
      status: true,
      drawAt: true,
      createdAt: true,
      prizes: {
        where: { product: { providerId: provider.id } },
        select: {
          id: true,
          position: true,
          product: {
            select: { id: true, name: true, imageKey: true }
          }
        }
      }
    }
  });

  const data = await Promise.all(raffles.map(async (raffle) => ({
    ...raffle,
    prizes: await Promise.all(raffle.prizes.map(async (prize) => ({
      ...prize,
      product: {
        ...prize.product,
        imageUrl: prize.product.imageKey ? await getSignedFileUrl(prize.product.imageKey) : null,
        imageKey: undefined
      }
    })))
  })));

  return { raffles: data, nextCursor: getNextCursor(raffles, limit) };
}

module.exports = {
  getProviderProfile,
  updateProviderProfile,
  uploadProviderLogo,
  getActiveRafflesWithMyProducts
};