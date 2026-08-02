// src/utils/pagination.js

/**
 * Parsea cursor y limit desde query params.
 * @param {object} query - req.query
 * @param {number} defaultLimit
 * @returns {{ cursor: number|null, limit: number }}
 */
function parsePagination(query, defaultLimit = 20) {
  const limit = Math.min(Math.max(Number(query.limit) || defaultLimit, 1), 100);
  const cursor = query.cursor && !isNaN(Number(query.cursor)) ? Number(query.cursor) : null;
  return { cursor, limit };
}

/**
 * Construye cláusula where para cursor pagination por id.
 * @param {number|null} cursor
 * @returns {object}
 */
function buildCursorWhere(cursor) {
  return cursor ? { id: { gt: cursor } } : {};
}

/**
 * Calcula nextCursor desde el último elemento de la lista.
 * @param {Array} items
 * @param {number} limit
 * @returns {number|null}
 */
function getNextCursor(items, limit) {
  return items.length === limit ? items[items.length - 1].id : null;
}

module.exports = { parsePagination, buildCursorWhere, getNextCursor };