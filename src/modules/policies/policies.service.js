// src/modules/policies/policies.service.js
const { getPrisma } = require('../../config/database');

const VALID_TYPES = ['terms', 'privacy', 'cookies', 'refund'];

async function getPolicies() {
  const prisma = getPrisma();
  const policies = await prisma.policy.findMany({
    where: { isActive: true },
    orderBy: { type: 'asc' },
    select: { id: true, type: true, title: true, locale: true, updatedAt: true }
  });
  return { policies };
}

async function getPolicyById(id) {
  const prisma = getPrisma();
  const policy = await prisma.policy.findUnique({
    where: { id: Number(id) },
    select: { id: true, type: true, title: true, content: true, locale: true, isActive: true, createdAt: true, updatedAt: true }
  });
  if (!policy) throw { status: 404, message: 'Política no encontrada' };
  return policy;
}

async function createPolicy(data) {
  const prisma = getPrisma();
  if (!VALID_TYPES.includes(data.type)) {
    throw { status: 400, message: `Tipo inválido. Valores permitidos: ${VALID_TYPES.join(', ')}` };
  }
  const policy = await prisma.policy.create({
    data: {
      type: data.type,
      title: data.title,
      content: data.content,
      locale: data.locale || 'es',
      isActive: true
    },
    select: { id: true, type: true, title: true, locale: true, isActive: true, createdAt: true, updatedAt: true }
  });
  return policy;
}

async function updatePolicy(id, data) {
  const prisma = getPrisma();
  const existing = await prisma.policy.findUnique({ where: { id: Number(id) } });
  if (!existing) throw { status: 404, message: 'Política no encontrada' };

  if (data.type && !VALID_TYPES.includes(data.type)) {
    throw { status: 400, message: `Tipo inválido. Valores permitidos: ${VALID_TYPES.join(', ')}` };
  }

  const updateData = {};
  if (data.type !== undefined) updateData.type = data.type;
  if (data.title !== undefined) updateData.title = data.title;
  if (data.content !== undefined) updateData.content = data.content;
  if (data.locale !== undefined) updateData.locale = data.locale;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  const policy = await prisma.policy.update({
    where: { id: Number(id) },
    data: updateData,
    select: { id: true, type: true, title: true, locale: true, isActive: true, createdAt: true, updatedAt: true }
  });
  return policy;
}

async function deletePolicy(id) {
  const prisma = getPrisma();
  const existing = await prisma.policy.findUnique({ where: { id: Number(id) } });
  if (!existing) throw { status: 404, message: 'Política no encontrada' };
  await prisma.policy.delete({ where: { id: Number(id) } });
  return { deleted: true };
}

module.exports = { getPolicies, getPolicyById, createPolicy, updatePolicy, deletePolicy };