const express = require('express');
const router = express.Router();
const providersService = require('./providers.service');
const { updateProviderSchema } = require('./providers.validation');
const { authMiddleware } = require('../../middlewares/auth.middleware');
const { requireRole } = require('../../middlewares/role.middleware');
const { imageUpload } = require('../../middlewares/upload.middleware');
const { success, error } = require('../../utils/response');

// GET /api/v1/providers/profile - Perfil del proveedor autenticado
router.get('/profile', authMiddleware, requireRole('provider'), async (req, res) => {
  try {
    const profile = await providersService.getProviderProfile(req.user.id);
    return success(res, profile);
  } catch (err) {
    return error(res, err.message || 'Error al obtener perfil', err.status || 500);
  }
});

// PUT /api/v1/providers/profile - Actualizar perfil del proveedor
router.put('/profile', authMiddleware, requireRole('provider'), async (req, res) => {
  try {
    const data = updateProviderSchema.parse(req.body);
    const profile = await providersService.updateProviderProfile(req.user.id, data);
    return success(res, profile);
  } catch (err) {
    return error(res, err.message || 'Error al actualizar perfil', err.status || 400);
  }
});

// POST /api/v1/providers/logo - Subir logo del proveedor
router.post('/logo', authMiddleware, requireRole('provider'), imageUpload.single('logo'), async (req, res) => {
  try {
    if (!req.file) return error(res, 'Logo requerido', 400);
    const result = await providersService.uploadProviderLogo(req.user.id, req.file);
    return success(res, result);
  } catch (err) {
    return error(res, err.message || 'Error al subir logo', err.status || 400);
  }
});

// GET /api/v1/providers/active-raffles - Rifas activas con productos del proveedor
router.get('/active-raffles', authMiddleware, requireRole('provider'), async (req, res) => {
  try {
    const raffles = await providersService.getActiveRafflesWithMyProducts(req.user.id, req.query);
    return success(res, raffles);
  } catch (err) {
    return error(res, err.message || 'Error al obtener rifas activas', err.status || 500);
  }
});

module.exports = router;