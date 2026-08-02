// src/modules/packages/ownerPackages.routes.js
const router = require('express').Router();
const packagesService = require('./packages.service');
const { authMiddleware } = require('../../middlewares/auth.middleware');
const { requireRole } = require('../../middlewares/role.middleware');
const { ok, error } = require('../../utils/response');

// GET /api/v1/owner-packages — owner/admin/superadmin
router.get('/', authMiddleware, requireRole('owner', 'admin', 'superadmin'), async (req, res, next) => {
  try {
    const result = await packagesService.getOwnerPackages(req.user.id, req.user.role, req.query);
    return ok(res, result);
  } catch (err) {
    if (err.status) return error(res, err.message, err.status);
    next(err);
  }
});

// GET /api/v1/owner-packages/:id — owner/admin/superadmin
router.get('/:id', authMiddleware, requireRole('owner', 'admin', 'superadmin'), async (req, res, next) => {
  try {
    const pkg = await packagesService.getPackageById(req.params.id);
    const isAdmin = ['admin', 'superadmin'].includes(req.user.role);
    if (!isAdmin && pkg.ownerId !== req.user.id) return error(res, 'Acceso denegado', 403);
    return ok(res, { package: pkg });
  } catch (err) {
    if (err.status) return error(res, err.message, err.status);
    next(err);
  }
});

module.exports = router;