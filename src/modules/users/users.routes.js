const router = require('express').Router();
const usersService = require('./users.service');
const { updateUserSchema, changePasswordSchema, setRoleSchema } = require('./users.validation');
const { authMiddleware } = require('../../middlewares/auth.middleware');
const { requireRole } = require('../../middlewares/role.middleware');
const { ok, error } = require('../../utils/response');

// GET /api/v1/users — solo admin/superadmin
router.get('/', authMiddleware, requireRole('admin', 'superadmin'), async (req, res, next) => {
  try {
    const { cursor, limit } = req.query;
    const result = await usersService.getUsers({ cursor, limit });
    return ok(res, result);
  } catch (err) {
    if (err.status) return error(res, err.message, err.status);
    next(err);
  }
});

// GET /api/v1/users/:id — admin/superadmin o el propio usuario
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const requestedId = Number(req.params.id);
    const isOwn = req.user.id === requestedId;
    const isAdmin = ['admin', 'superadmin'].includes(req.user.role);
    if (!isOwn && !isAdmin) return error(res, 'Acceso denegado', 403);

    const user = await usersService.getUserById(requestedId);
    return ok(res, { user });
  } catch (err) {
    if (err.status) return error(res, err.message, err.status);
    next(err);
  }
});

// PUT /api/v1/users/:id — el propio usuario o admin
router.put('/:id', authMiddleware, async (req, res, next) => {
  try {
    const requestedId = Number(req.params.id);
    const isOwn = req.user.id === requestedId;
    const isAdmin = ['admin', 'superadmin'].includes(req.user.role);
    if (!isOwn && !isAdmin) return error(res, 'Acceso denegado', 403);

    const data = updateUserSchema.parse(req.body);
    const user = await usersService.updateUser(requestedId, data);
    return ok(res, { user });
  } catch (err) {
    if (err.errors) return error(res, err.errors, 422);
    if (err.status) return error(res, err.message, err.status);
    next(err);
  }
});

// PUT /api/v1/users/:id/password — solo el propio usuario
router.put('/:id/password', authMiddleware, async (req, res, next) => {
  try {
    const requestedId = Number(req.params.id);
    if (req.user.id !== requestedId) return error(res, 'Acceso denegado', 403);

    const data = changePasswordSchema.parse(req.body);
    const result = await usersService.changePassword(requestedId, data);
    return ok(res, result);
  } catch (err) {
    if (err.errors) return error(res, err.errors, 422);
    if (err.status) return error(res, err.message, err.status);
    next(err);
  }
});

// DELETE /api/v1/users/:id — solo admin/superadmin
router.delete('/:id', authMiddleware, requireRole('admin', 'superadmin'), async (req, res, next) => {
  try {
    const result = await usersService.deactivateUser(Number(req.params.id));
    return ok(res, result);
  } catch (err) {
    if (err.status) return error(res, err.message, err.status);
    next(err);
  }
});

// PUT /api/v1/users/:id/role — solo superadmin
router.put('/:id/role', authMiddleware, requireRole('superadmin'), async (req, res, next) => {
  try {
    const data = setRoleSchema.parse(req.body);
    const user = await usersService.setUserRole(Number(req.params.id), data.role);
    return ok(res, { user });
  } catch (err) {
    if (err.errors) return error(res, err.errors, 422);
    if (err.status) return error(res, err.message, err.status);
    next(err);
  }
});

module.exports = router;