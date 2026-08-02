// src/modules/history/history.service.js
const { getPrisma } = require('../../config/database');
const { parsePagination, buildCursorWhere, getNextCursor } = require('../../utils/pagination');

async function getMyHistory(userId, query) {
  const prisma = getPrisma();
  const { cursor, limit } = parsePagination(query);

  const entries = await prisma.historyEntry.findMany({
    where: { userId: Number(userId), ...buildCursorWhere(cursor) },
    take: limit,
    orderBy: { id: 'desc' },
    select: {
      id: true,
      type: true,
      title: true,
      meta: true,
      createdAt: true
    }
  });

  return { history: entries, nextCursor: getNextCursor(entries, limit) };
}

async function addHistoryEntry({ userId, type, title, meta }) {
  const prisma = getPrisma();
  await prisma.historyEntry.create({
    data: {
      userId: Number(userId),
      type,
      title,
      meta: meta ?? null
    }
  });
}

module.exports = { getMyHistory, addHistoryEntry };