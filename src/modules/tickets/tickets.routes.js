// src/modules/tickets/tickets.routes.js
const router = require('express').Router();
const ticketsService = require('./tickets.service');
const { purchaseSchema } = require('./tickets.validation');
const { authMiddleware } = require('../../middlewares/auth.middleware');
const { requireRole } = require('../../middlewares/role.middleware');
const { idempotencyMiddleware } = require('../../middlewares/idempotency.middleware');
const { ok, error } = require('../../utils/response');

// GET /api/v1/tickets — propio usuario o admin
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const result = await ticketsService.getMyTickets(req.user.id, req.query);
    return ok(res, result);
  } catch (err) {
    if (err.status) return error(res, err.message, err.status);
    next(err);
  }
});

// GET /api/v1/tickets/:id — propio usuario o admin
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const ticket = await ticketsService.getTicketById(req.params.id, req.user.id, req.user.role);
    return ok(res, { ticket });
  } catch (err) {
    if (err.status) return error(res, err.message, err.status);
    next(err);
  }
});

// POST /api/v1/tickets — user/owner (compra/reserva) con idempotencia
router.post('/', authMiddleware, requireRole('user', 'owner', 'admin', 'superadmin'), idempotencyMiddleware, async (req, res, next) => {
  try {
    const data = purchaseSchema.parse(req.body);
    const result = await ticketsService.purchaseTickets(req.user.id, data);
    return res.status(201).json({ success: true, data: result });
  } catch (err) {
    if (err.errors) return error(res, err.errors, 422);
    if (err.status) return error(res, err.message, err.status);
    next(err);
  }
});

module.exports = router;