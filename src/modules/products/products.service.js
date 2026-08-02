const { getPrisma } = require('../../config/database');
const { uploadFile, deleteFile, getSignedFileUrl } = require('../../services/storage.service');
const { validateFile } = require('../../utils/fileValidator');
const { parsePagination, buildCursorWhere, getNextCursor } = require('../../utils/pagination');

const SAFE_PRODUCT_FIELDS = {
  id: true,
  providerId: true,
  name: true,
  description: true,
  imageKey: true,
  videoKey: true,
  price: true,
  currency: true,
  claimAddress: true,
  stock: true,
  isActive: true,
  createdAt: true,
  updatedAt: true
};

async function _withSignedUrls(product) {
  return {
    ...product,
    imageUrl: product.imageKey ? await getSignedFileUrl(product.imageKey) : null,
    videoUrl: product.videoKey ? await getSignedFileUrl(product.videoKey) : null,
    imageKey: undefined,
    videoKey: undefined
  };
}

async function getPublicProducts(query) {
  const prisma = getPrisma();
  const { cursor, limit } = parsePagination(query);
  const where = {
    ...buildCursorWhere(cursor),
    isActive: true,
    stock: { gt: 0 }
  };

  const products = await prisma.product.findMany({
    where,
    take: limit,
    orderBy: { id: 'asc' },
    select: {
      ...SAFE_PRODUCT_FIELDS,
      provider: {
        select: {
          id: true,
          businessName: true,
          city: true,
          country: true
        }
      }
    }
  });

  const data = await Promise.all(products.map(_withSignedUrls));
  return { products: data, nextCursor: getNextCursor(products, limit) };
}

async function getPublicProductById(id) {
  const prisma = getPrisma();
  const product = await prisma.product.findFirst({
    where: {
      id: Number(id),
      isActive: true,
      stock: { gt: 0 }
    },
    select: {
      ...SAFE_PRODUCT_FIELDS,
      provider: {
        select: {
          id: true,
          businessName: true,
          description: true,
          phone: true,
          address: true,
          city: true,
          country: true
        }
      }
    }
  });
  if (!product) throw { status: 404, message: 'Producto no encontrado' };
  return _withSignedUrls(product);
}

async function createProduct(userId, data) {
  const prisma = getPrisma();
  const provider = await prisma.provider.findUnique({ where: { userId } });
  if (!provider) throw { status: 404, message: 'Perfil de proveedor no encontrado' };

  const product = await prisma.product.create({
    data: {
      providerId: provider.id,
      ...data
    },
    select: SAFE_PRODUCT_FIELDS
  });

  return _withSignedUrls(product);
}

async function getMyProducts(userId, query) {
  const prisma = getPrisma();
  const provider = await prisma.provider.findUnique({ where: { userId } });
  if (!provider) throw { status: 404, message: 'Perfil de proveedor no encontrado' };

  const { cursor, limit } = parsePagination(query);
  const where = {
    ...buildCursorWhere(cursor),
    providerId: provider.id
  };

  const products = await prisma.product.findMany({
    where,
    take: limit,
    orderBy: { id: 'asc' },
    select: SAFE_PRODUCT_FIELDS
  });

  const data = await Promise.all(products.map(_withSignedUrls));
  return { products: data, nextCursor: getNextCursor(products, limit) };
}

async function updateProduct(userId, productId, data) {
  const prisma = getPrisma();
  const provider = await prisma.provider.findUnique({ where: { userId } });
  if (!provider) throw { status: 404, message: 'Perfil de proveedor no encontrado' };

  const product = await prisma.product.findUnique({
    where: { id: Number(productId) },
    include: {
      rafflePrizes: {
        include: {
          raffle: { select: { id: true, status: true } }
        }
      }
    }
  });

  if (!product) throw { status: 404, message: 'Producto no encontrado' };
  if (product.providerId !== provider.id) throw { status: 403, message: 'Acceso denegado' };

  // Validar: NO se puede desactivar si está en rifas activas
  if (data.isActive === false) {
    const activeRaffles = product.rafflePrizes.filter(p => ['active', 'closed'].includes(p.raffle.status));
    if (activeRaffles.length > 0) {
      throw { status: 400, message: 'No puedes desactivar un producto que está en rifas activas' };
    }
  }

  const updated = await prisma.product.update({
    where: { id: Number(productId) },
    data,
    select: SAFE_PRODUCT_FIELDS
  });

  return _withSignedUrls(updated);
}

async function deleteProduct(userId, productId) {
  const prisma = getPrisma();
  const provider = await prisma.provider.findUnique({ where: { userId } });
  if (!provider) throw { status: 404, message: 'Perfil de proveedor no encontrado' };

  const product = await prisma.product.findUnique({
    where: { id: Number(productId) },
    include: { rafflePrizes: true }
  });

  if (!product) throw { status: 404, message: 'Producto no encontrado' };
  if (product.providerId !== provider.id) throw { status: 403, message: 'Acceso denegado' };

  // Validar: NO se puede eliminar si tiene premios asociados
  if (product.rafflePrizes.length > 0) {
    throw { status: 400, message: 'No puedes eliminar un producto que ya ha sido usado en rifas' };
  }

  await deleteFile(product.imageKey);
  await deleteFile(product.videoKey);

  await prisma.product.delete({ where: { id: Number(productId) } });
  return { deleted: true };
}

async function uploadProductImage(userId, productId, file) {
  const prisma = getPrisma();
  const provider = await prisma.provider.findUnique({ where: { userId } });
  if (!provider) throw { status: 404, message: 'Perfil de proveedor no encontrado' };

  const product = await prisma.product.findUnique({ where: { id: Number(productId) } });
  if (!product) throw { status: 404, message: 'Producto no encontrado' };
  if (product.providerId !== provider.id) throw { status: 403, message: 'Acceso denegado' };

  validateFile(file.buffer, file.mimetype, 'image');

  await deleteFile(product.imageKey);

  const key = await uploadFile(file.buffer, 'products/images', file.mimetype);
  await prisma.product.update({ where: { id: Number(productId) }, data: { imageKey: key } });

  return { imageUrl: await getSignedFileUrl(key) };
}

async function uploadProductVideo(userId, productId, file) {
  const prisma = getPrisma();
  const provider = await prisma.provider.findUnique({ where: { userId } });
  if (!provider) throw { status: 404, message: 'Perfil de proveedor no encontrado' };

  const product = await prisma.product.findUnique({ where: { id: Number(productId) } });
  if (!product) throw { status: 404, message: 'Producto no encontrado' };
  if (product.providerId !== provider.id) throw { status: 403, message: 'Acceso denegado' };

  validateFile(file.buffer, file.mimetype, 'video');

  await deleteFile(product.videoKey);

  const key = await uploadFile(file.buffer, 'products/videos', file.mimetype);
  await prisma.product.update({ where: { id: Number(productId) }, data: { videoKey: key } });

  return { videoUrl: await getSignedFileUrl(key) };
}

module.exports = {
  getPublicProducts,
  getPublicProductById,
  createProduct,
  getMyProducts,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  uploadProductVideo
};