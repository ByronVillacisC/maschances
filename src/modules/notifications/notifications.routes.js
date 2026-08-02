// src/modules/notifications/notifications.routes.js
const router = require('express').Router();
const { authMiddleware } = require('../../middlewares/auth.middleware');
const { ok, error } = require('../../utils/response');
const notificationsService = require('./notifications.service');
const { notificationIdParamSchema } = require('./notifications.validation');

// GET /api/v1/notifications — user
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const result = await notificationsService.listMyNotifications(req.user.id, req.query);
    return ok(res, result);
  } catch (err) {
    if (err.status) return error(res, err.message, err.status);
    next(err);
  }
});

// GET /api/v1/notifications/:id — user
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = notificationIdParamSchema.parse(req.params);
    const notification = await notificationsService.getMyNotificationById(req.user.id, id);
    return ok(res, { notification });
  } catch (err) {
    if (err.errors) return error(res, err.errors, 422);
    if (err.status) return error(res, err.message, err.status);
    next(err);
  }
});

// PUT /api/v1/notifications/:id/read — user
router.put('/:id/read', authMiddleware, async (req, res, next) => {
  try {
    const { id } = notificationIdParamSchema.parse(req.params);
    const result = await notificationsService.markAsRead(req.user.id, id);
    return ok(res, result);
  } catch (err) {
    if (err.errors) return error(res, err.errors, 422);
    if (err.status) return error(res, err.message, err.status);
    next(err);
  }
});

/**
 * Endpoint existente de fases previas (stub).
 * Se conserva para NO romper compatibilidad.
 */
// POST /api/v1/notifications
router.post('/', (req, res) => {
  res.status(201).json({ module: 'notifications', endpoint: 'POST /', status: 'phase-1-stub' });
});

module.exports = router;