// src/modules/users/users.service.js
const bcrypt = require('bcryptjs');
const { getPrisma } = require('../../config/database');
const { parsePagination, buildCursorWhere, getNextCursor } = require('../../utils/pagination');

const SALT_ROUNDS = 12;

const SAFE_FIELDS = {
  id: true,
  email: true,
  role: true,
  firstName: true,
  lastName: true,
  phone: true,
  country: true,
  isActive: true,
  isEmailVerified: true,
  twoFactorEnabled: true,
  createdAt: true,
  updatedAt: true
};

async function getUsers(query) {
  const prisma = getPrisma();
  const { cursor, limit } = parsePagination(query);
  const where = buildCursorWhere(cursor);

  const users = await prisma.user.findMany({
    where,
    take: limit,
    orderBy: { id: 'asc' },
    select: SAFE_FIELDS
  });

  return { users, nextCursor: getNextCursor(users, limit) };
}

async function getUserById(id) {
  const prisma = getPrisma();
  const user = await prisma.user.findUnique({
    where: { id: Number(id) },
    select: SAFE_FIELDS
  });
  if (!user) throw { status: 404, message: 'Usuario no encontrado' };
  return user;
}

async function updateUser(id, { firstName, lastName, phone, country }) {
  const prisma = getPrisma();
  const user = await prisma.user.update({
    where: { id: Number(id) },
    data: { firstName, lastName, phone, country },
    select: SAFE_FIELDS
  });
  return user;
}

async function changePassword(id, { currentPassword, newPassword }) {
  const prisma = getPrisma();
  const user = await prisma.user.findUnique({ where: { id: Number(id) } });
  if (!user) throw { status: 404, message: 'Usuario no encontrado' };

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) throw { status: 401, message: 'Contraseña actual incorrecta' };

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await prisma.user.update({ where: { id: Number(id) }, data: { passwordHash } });
  return { updated: true };
}

async function deactivateUser(id) {
  const prisma = getPrisma();
  await prisma.user.update({ where: { id: Number(id) }, data: { isActive: false } });
  return { deactivated: true };
}

async function setUserRole(id, role) {
  const VALID_ROLES = ['user', 'owner', 'admin', 'superadmin'];
  if (!VALID_ROLES.includes(role)) throw { status: 400, message: 'Rol inválido' };

  const prisma = getPrisma();
  const user = await prisma.user.update({
    where: { id: Number(id) },
    data: { role },
    select: SAFE_FIELDS
  });
  return user;
}

module.exports = { getUsers, getUserById, updateUser, changePassword, deactivateUser, setUserRole };