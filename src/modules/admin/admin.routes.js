const router = require('express').Router();
const adminService = require('./admin.service');
const { setPermissionSchema, setCommissionSchema, userIdParamSchema } = require('./admin.validation');
const { authMiddleware } = require('../../middlewares/auth.middleware');
const { requireRole } = require('../../middlewares/role.middleware');
const { ok, error } = require('../../utils/response');

// GET /api/v1/admin/permissions — superadmin
router.get('/permissions', authMiddleware, requireRole('superadmin'), async (req, res, next) => {
  try {
    const result = await adminService.getPermissions(req.query);
    return ok(res, result);
  } catch (err) {
    if (err.status) return error(res, err.message, err.status);
    next(err);
  }
});

// PUT /api/v1/admin/permissions/:userId — superadmin
// CAMBIO: ahora soporta asignar rol 'provider' manualmente
router.put('/permissions/:userId', authMiddleware, requireRole('superadmin'), async (req, res, next) => {
  try {
    const { userId } = userIdParamSchema.parse(req.params);
    const { role } = setPermissionSchema.parse(req.body);
    const result = await adminService.setPermission(userId, role);
    return ok(res, result);
  } catch (err) {
    if (err.errors) return error(res, err.errors, 422);
    if (err.status) return error(res, err.message, err.status);
    next(err);
  }
});

// GET /api/v1/admin/commission — admin/superadmin
router.get('/commission', authMiddleware, requireRole('admin', 'superadmin'), async (req, res, next) => {
  try {
    const result = await adminService.getCommission();
    return ok(res, result);
  } catch (err) {
    if (err.status) return error(res, err.message, err.status);
    next(err);
  }
});

// PUT /api/v1/admin/commission — superadmin
router.put('/commission', authMiddleware, requireRole('superadmin'), async (req, res, next) => {
  try {
    const { rate } = setCommissionSchema.parse(req.body);
    const result = await adminService.setCommission(rate);
    return ok(res, result);
  } catch (err) {
    if (err.errors) return error(res, err.errors, 422);
    if (err.status) return error(res, err.message, err.status);
    next(err);
  }
});

module.exports = router;
