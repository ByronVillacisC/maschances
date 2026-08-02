const express = require('express');
const router = express.Router();
const rafflesService = require('./raffles.service');
const { createRaffleSchema, updateRaffleSchema } = require('./raffles.validation');
const { authMiddleware } = require('../../middlewares/auth.middleware');
const { requireRole } = require('../../middlewares/role.middleware');
const { imageUpload } = require('../../middlewares/upload.middleware');
const { success, error } = require('../../utils/response');

// GET /api/v1/raffles - Listar rifas públicas
router.get('/', async (req, res) => {
  try {
    const raffles = await rafflesService.getRaffles(req.query);
    return success(res, raffles);
  } catch (err) {
    return error(res, err.message || 'Error al obtener rifas', err.status || 500);
  }
});

// GET /api/v1/raffles/:id - Detalle de rifa
router.get('/:id', async (req, res) => {
  try {
    const raffle = await rafflesService.getRaffleById(req.params.id);
    return success(res, raffle);
  } catch (err) {
    return error(res, err.message || 'Error al obtener rifa', err.status || 404);
  }
});

// POST /api/v1/raffles - Crear rifa (owner)
// CAMBIO: el sorteo se crea con estado 'active' automáticamente (ver raffles.service.js)
router.post('/', authMiddleware, requireRole('owner', 'admin', 'superadmin'), async (req, res) => {
  try {
    const data = createRaffleSchema.parse(req.body);
    const raffle = await rafflesService.createRaffle(req.user.id, data);
    return success(res, raffle, 'Rifa creada', 201);
  } catch (err) {
    return error(res, err.message || 'Error al crear rifa', err.status || 400);
  }
});

// PUT /api/v1/raffles/:id - Actualizar rifa
router.put('/:id', authMiddleware, requireRole('owner', 'admin', 'superadmin'), async (req, res) => {
  try {
    const data = updateRaffleSchema.parse(req.body);
    const raffle = await rafflesService.updateRaffle(req.params.id, req.user.id, req.user.role, data);
    return success(res, raffle);
  } catch (err) {
    return error(res, err.message || 'Error al actualizar rifa', err.status || 400);
  }
});

// DELETE /api/v1/raffles/:id - Eliminar rifa
router.delete('/:id', authMiddleware, requireRole('owner', 'admin', 'superadmin'), async (req, res) => {
  try {
    const result = await rafflesService.deleteRaffle(req.params.id, req.user.id, req.user.role);
    return success(res, result);
  } catch (err) {
    return error(res, err.message || 'Error al eliminar rifa', err.status || 400);
  }
});

// POST /api/v1/raffles/:id/prize-image - Subir imagen del premio
router.post('/:id/prize-image', authMiddleware, requireRole('owner', 'admin', 'superadmin'), imageUpload.single('image'), async (req, res) => {
  try {
    if (!req.file) return error(res, 'Imagen requerida', 400);
    const result = await rafflesService.uploadPrizeImage(req.params.id, req.user.id, req.user.role, req.file);
    return success(res, result);
  } catch (err) {
    return error(res, err.message || 'Error al subir imagen', err.status || 400);
  }
});

// FASE 8 - Subrutas de premios (productos)
router.use('/:raffleId/prizes', require('./prizes.routes'));

module.exports = router;
