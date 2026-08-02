// src/modules/notifications/notifications.service.js
const { getPrisma } = require('../../config/database');
const { parsePagination, buildCursorWhere, getNextCursor } = require('../../utils/pagination');

async function listMyNotifications(userId, query) {
  const prisma = getPrisma();
  const { cursor, limit } = parsePagination(query);

  const notifications = await prisma.notification.findMany({
    where: { userId: Number(userId), ...buildCursorWhere(cursor) },
    take: limit,
    orderBy: { id: 'asc' }
  });

  return { notifications, nextCursor: getNextCursor(notifications, limit) };
}

async function getMyNotificationById(userId, id) {
  const prisma = getPrisma();
  const n = await prisma.notification.findUnique({ where: { id: Number(id) } });
  if (!n) throw { status: 404, message: 'Notificación no encontrada' };
  if (n.userId !== Number(userId)) throw { status: 403, message: 'Acceso denegado' };
  return n;
}

async function markAsRead(userId, id) {
  const prisma = getPrisma();
  const n = await getMyNotificationById(userId, id);

  if (n.readAt) return { notification: n };

  const updated = await prisma.notification.update({
    where: { id: n.id },
    data: { readAt: new Date() }
  });

  return { notification: updated };
}

module.exports = { listMyNotifications, getMyNotificationById, markAsRead };