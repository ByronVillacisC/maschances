const express = require('express');
const router = express.Router({ mergeParams: true });
const prizesService = require('./prizes.service');
const { addPrizeSchema } = require('./prizes.validation');
const { authMiddleware } = require('../../middlewares/auth.middleware');
const { requireRole } = require('../../middlewares/role.middleware');
const { success, error } = require('../../utils/response');

// GET /api/v1/raffles/:raffleId/prizes - Listar premios de una rifa
router.get('/', async (req, res) => {
  try {
    const prizes = await prizesService.getRafflePrizes(req.params.raffleId);
    return success(res, prizes);
  } catch (err) {
    return error(res, err.message || 'Error al obtener premios', err.status || 500);
  }
});

// POST /api/v1/raffles/:raffleId/prizes - Agregar producto como premio (máx 10)
router.post('/', authMiddleware, requireRole('owner', 'admin', 'superadmin'), async (req, res) => {
  try {
    const data = addPrizeSchema.parse(req.body);
    const prize = await prizesService.addPrizeToRaffle(req.user.id, req.user.role, req.params.raffleId, data);
    return success(res, prize, 'Premio agregado', 201);
  } catch (err) {
    return error(res, err.message || 'Error al agregar premio', err.status || 400);
  }
});

// DELETE /api/v1/raffles/:raffleId/prizes/:prizeId - Eliminar premio
router.delete('/:prizeId', authMiddleware, requireRole('owner', 'admin', 'superadmin'), async (req, res) => {
  try {
    const result = await prizesService.removePrizeFromRaffle(req.user.id, req.user.role, req.params.raffleId, req.params.prizeId);
    return success(res, result);
  } catch (err) {
    return error(res, err.message || 'Error al eliminar premio', err.status || 400);
  }
});

module.exports = router;