// src/modules/packages/packages.service.js
const { getPrisma } = require('../../config/database');
const { uploadFile, deleteFile, getSignedFileUrl } = require('../../services/storage.service');
const { validateFile } = require('../../utils/fileValidator');
const { parsePagination, buildCursorWhere, getNextCursor } = require('../../utils/pagination');

const SAFE_PACKAGE_FIELDS = {
  id: true,
  ownerId: true,
  title: true,
  description: true,
  imageKey: true,
  videoKey: true,
  isActive: true,
  createdAt: true,
  updatedAt: true
};

async function _withSignedUrls(pkg) {
  return {
    ...pkg,
    imageUrl: pkg.imageKey ? await getSignedFileUrl(pkg.imageKey) : null,
    videoUrl: pkg.videoKey ? await getSignedFileUrl(pkg.videoKey) : null,
    imageKey: undefined,
    videoKey: undefined
  };
}

async function getPackages(query) {
  const prisma = getPrisma();
  const { cursor, limit } = parsePagination(query);
  const where = { ...buildCursorWhere(cursor), isActive: true };

  const packages = await prisma.package.findMany({
    where,
    take: limit,
    orderBy: { id: 'asc' },
    select: SAFE_PACKAGE_FIELDS
  });

  const data = await Promise.all(packages.map(_withSignedUrls));
  return { packages: data, nextCursor: getNextCursor(packages, limit) };
}

async function getPackageById(id) {
  const prisma = getPrisma();
  const pkg = await prisma.package.findUnique({
    where: { id: Number(id) },
    select: SAFE_PACKAGE_FIELDS
  });
  if (!pkg) throw { status: 404, message: 'Paquete no encontrado' };
  return _withSignedUrls(pkg);
}

async function createPackage(ownerId, data) {
  const prisma = getPrisma();
  const pkg = await prisma.package.create({
    data: { ownerId, ...data },
    select: SAFE_PACKAGE_FIELDS
  });
  return _withSignedUrls(pkg);
}

async function updatePackage(id, ownerId, role, data) {
  const prisma = getPrisma();
  const pkg = await prisma.package.findUnique({ where: { id: Number(id) } });
  if (!pkg) throw { status: 404, message: 'Paquete no encontrado' };

  const isAdmin = ['admin', 'superadmin'].includes(role);
  if (!isAdmin && pkg.ownerId !== ownerId) throw { status: 403, message: 'Acceso denegado' };

  const updated = await prisma.package.update({
    where: { id: Number(id) },
    data,
    select: SAFE_PACKAGE_FIELDS
  });
  return _withSignedUrls(updated);
}

async function deletePackage(id, ownerId, role) {
  const prisma = getPrisma();
  const pkg = await prisma.package.findUnique({ where: { id: Number(id) } });
  if (!pkg) throw { status: 404, message: 'Paquete no encontrado' };

  const isAdmin = ['admin', 'superadmin'].includes(role);
  if (!isAdmin && pkg.ownerId !== ownerId) throw { status: 403, message: 'Acceso denegado' };

  // Eliminar media del bucket
  await deleteFile(pkg.imageKey);
  await deleteFile(pkg.videoKey);

  await prisma.package.delete({ where: { id: Number(id) } });
  return { deleted: true };
}

async function uploadPackageImage(id, ownerId, role, file) {
  const prisma = getPrisma();
  const pkg = await prisma.package.findUnique({ where: { id: Number(id) } });
  if (!pkg) throw { status: 404, message: 'Paquete no encontrado' };

  const isAdmin = ['admin', 'superadmin'].includes(role);
  if (!isAdmin && pkg.ownerId !== ownerId) throw { status: 403, message: 'Acceso denegado' };

  validateFile(file.buffer, file.mimetype, 'image');

  // Eliminar imagen anterior si existe
  await deleteFile(pkg.imageKey);

  const key = await uploadFile(file.buffer, 'packages/images', file.mimetype);
  await prisma.package.update({ where: { id: Number(id) }, data: { imageKey: key } });

  return { imageUrl: await getSignedFileUrl(key) };
}

async function uploadPackageVideo(id, ownerId, role, file) {
  const prisma = getPrisma();
  const pkg = await prisma.package.findUnique({ where: { id: Number(id) } });
  if (!pkg) throw { status: 404, message: 'Paquete no encontrado' };

  const isAdmin = ['admin', 'superadmin'].includes(role);
  if (!isAdmin && pkg.ownerId !== ownerId) throw { status: 403, message: 'Acceso denegado' };

  validateFile(file.buffer, file.mimetype, 'video');

  await deleteFile(pkg.videoKey);

  const key = await uploadFile(file.buffer, 'packages/videos', file.mimetype);
  await prisma.package.update({ where: { id: Number(id) }, data: { videoKey: key } });

  return { videoUrl: await getSignedFileUrl(key) };
}

async function getOwnerPackages(ownerId, role, query) {
  const prisma = getPrisma();
  const { cursor, limit } = parsePagination(query);

  // admin/superadmin ven todos; owner solo los suyos
  const isAdmin = ['admin', 'superadmin'].includes(role);
  const where = {
    ...buildCursorWhere(cursor),
    ...(isAdmin ? {} : { ownerId: Number(ownerId) })
  };

  const packages = await prisma.package.findMany({
    where,
    take: limit,
    orderBy: { id: 'asc' },
    select: SAFE_PACKAGE_FIELDS
  });

  const data = await Promise.all(packages.map(_withSignedUrls));
  return { packages: data, nextCursor: getNextCursor(packages, limit) };
}

module.exports = {
  getPackages,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage,
  uploadPackageImage,
  uploadPackageVideo,
  getOwnerPackages
};