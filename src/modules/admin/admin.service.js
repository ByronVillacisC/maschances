const { getPrisma } = require('../../config/database');

// CAMBIO: incluir 'provider' en roles válidos para que Admin pueda asignar proveedores manualmente
const VALID_ROLES = ['user', 'owner', 'provider', 'admin', 'superadmin'];

async function getPermissions(query) {
  const prisma = getPrisma();
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);
  const cursor = query.cursor && !isNaN(Number(query.cursor)) ? Number(query.cursor) : null;

  const users = await prisma.user.findMany({
    where: cursor ? { id: { gt: cursor } } : {},
    take: limit,
    orderBy: { id: 'asc' },
    select: { id: true, email: true, role: true, isActive: true, createdAt: true }
  });

  const nextCursor = users.length === limit ? users[users.length - 1].id : null;
  return { users, nextCursor };
}

async function setPermission(userId, role) {
  const prisma = getPrisma();
  if (!VALID_ROLES.includes(role)) {
    throw { status: 400, message: `Rol inválido. Valores permitidos: ${VALID_ROLES.join(', ')}` };
  }
  const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
  if (!user) throw { status: 404, message: 'Usuario no encontrado' };

  // CAMBIO: si se asigna rol 'provider' y el usuario no tiene perfil Provider, crear uno básico
  if (role === 'provider') {
    const existingProvider = await prisma.provider.findUnique({ where: { userId: Number(userId) } });
    if (!existingProvider) {
      await prisma.provider.create({
        data: {
          userId: Number(userId),
          businessName: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.email,
          isActive: true
        }
      });
    }
  }

  const updated = await prisma.user.update({
    where: { id: Number(userId) },
    data: { role },
    select: { id: true, email: true, role: true, isActive: true }
  });
  return { user: updated };
}

async function getCommission() {
  const prisma = getPrisma();
  const config = await prisma.appConfig.findUnique({ where: { key: 'commission_rate' } });
  return { commissionRate: config ? config.value : '0' };
}

async function setCommission(rate) {
  const parsed = parseFloat(rate);
  if (isNaN(parsed) || parsed < 0 || parsed > 100) {
    throw { status: 400, message: 'La comisión debe ser un número entre 0 y 100' };
  }
  const prisma = getPrisma();
  const config = await prisma.appConfig.upsert({
    where: { key: 'commission_rate' },
    update: { value: String(parsed) },
    create: { key: 'commission_rate', value: String(parsed) }
  });
  return { commissionRate: config.value };
}

module.exports = { getPermissions, setPermission, getCommission, setCommission };
