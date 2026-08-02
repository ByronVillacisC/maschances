// src/modules/notifications/history.routes.js
const router = require('express').Router();
const historyService = require('../history/history.service');
const { authMiddleware } = require('../../middlewares/auth.middleware');
const { ok, error } = require('../../utils/response');

// GET /api/v1/history — user
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const result = await historyService.getMyHistory(req.user.id, req.query);
    return ok(res, result);
  } catch (err) {
    if (err.status) return error(res, err.message, err.status);
    next(err);
  }
});

module.exports = router;